const DEFAULT_TODOIST_PRIORITY = 1;
const JIRA_PRIORITY_MAPPING = {
  'Trivial': DEFAULT_TODOIST_PRIORITY,
  'Minor': DEFAULT_TODOIST_PRIORITY,
  'Major': DEFAULT_TODOIST_PRIORITY,
  'Critical': DEFAULT_TODOIST_PRIORITY,
  'Blocker': DEFAULT_TODOIST_PRIORITY
};

const defaultConfig = {
  todoist: {
    todoistApiKey: ''
  },
  popup: {
    timeoutMs: 2000
  },
  gmail: {
    taskTemplate: '$message [$subject ($source)]($href)',
    embedButton: 'true',
    regexIdentifier: '^https:\\/\\/mail\\.google\\.com'
  },
  confluence: {
    taskTemplate: '$message [$title ($source)]($href)',
    regexIdentifier: '^https:\\/\\/[^.]+\\.atlassian\\.net\\/wiki\\/'
  },
  jira: {
    taskTemplate: '$message [$summary ($source)]($href)',
    priorityMappingEnabled: 'false',
    priorityMapping: JIRA_PRIORITY_MAPPING,
    regexIdentifier: '^https:\\/\\/[^.]+\\.atlassian\\.net\\/'
  },
  website: {
    taskTemplate: '$message [$title ($source)]($href)',
    regexIdentifier: '.*'
  }
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ configuration: defaultConfig });
});

// export
top.DEFAULTS = top.DEFAULTS || {};
top.DEFAULTS.DEFAULT_TODOIST_PRIORITY = DEFAULT_TODOIST_PRIORITY;