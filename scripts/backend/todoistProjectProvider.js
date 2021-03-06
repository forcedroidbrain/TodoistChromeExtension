// requires LOGGING, CONFIG_STORE, TODOIST_CLIENT

class TodoistProjectProvider {

  constructor(refreshIntervalMs, backOffTimeoutMs) {
    this.projects = [];
    this.refreshIntervalMs = refreshIntervalMs;
    this.backOffTimeoutMs = backOffTimeoutMs;
    this.loadingInProgress = false;
  }

  static _storeProjects(projects) {
    top.LOGGER.info('Storing projects from Todoist.');
    const projectsState = {
      loaded: true,
      projects
    };
    return top.CONFIG_STORE.storeProjectsState(projectsState);
  }

  _reschedule() {
    setTimeout(() => this._loadProjectsIfKeyAvailable(), 2000);
  }

  _lock() {
    if (this.loadingInProgress) {
      return false;
    } else {
      this.loadingInProgress = true;
      return this.loadingInProgress;
    }
  }

  _release() {
    this.loadingInProgress = false;
  }

  _loadProjects() {
    top.TODOIST_CLIENT.getProjects()
      .then(projects => JSON.parse(projects))
      .then(TodoistProjectProvider._storeProjects)
      .then(() => this._release())
      .catch((err) => {
        top.LOGGER.warn('Failed to load Todoist projects, trying again in', this.backOffTimeoutMs, 'ms...', err);
        this._reschedule();
      });
  }

  _loadProjectsIfKeyAvailable() {
    TodoistClient.hasApiKey() // eslint-disable-line no-undef
      .then((hasApiKey) => {
        if (hasApiKey) {
          this._loadProjects();
        } else {
          top.LOGGER.debug('Todoist API key is missing in the configuration. Getting projects postponed by',
            this.backOffTimeoutMs, 'ms...');
          this._reschedule();
        }
      })
      .catch((err) => {
        top.LOGGER.error('Unexpected error happened', err, ', trying again in', this.backOffTimeoutMs, 'ms...');
        this._reschedule();
      });
  }

  _loadProjectsExclusively() {
    const lockAcquired = this._lock();
    if (lockAcquired) {
      top.LOGGER.debug('Running periodic project refresh');
      this._loadProjectsIfKeyAvailable();
    }
  }

  init() {
    this._loadProjectsExclusively();
    setInterval(() => this._loadProjectsExclusively(), this.refreshIntervalMs);
  }

  getProjectsState() {
    return top.CONFIG_STORE.loadProjectsState();
  }
}

// exports
if (!top.TODOIST_PROJECT_PROVIDER) {
  const BACKOFF_TIMEOUT_MS = 2000;    // 2 seconds
  const REFRESH_INTERVAL_MS = 120000; // 2 minutes
  const todoistProjectProvider = new TodoistProjectProvider(REFRESH_INTERVAL_MS, BACKOFF_TIMEOUT_MS);
  todoistProjectProvider.init();

  top.TODOIST_PROJECT_PROVIDER = todoistProjectProvider;
}

