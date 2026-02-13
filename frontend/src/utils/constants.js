export const STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  BLOCKED: 'blocked',
  SKIPPED: 'skipped'
};

export const SEVERITY = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  TRIVIAL: 'trivial'
};

export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const LANGUAGES = {
  EN: 'en',
  JA: 'ja'
};

export const TEMPLATE_KEYS = {
  LOGIN_FLOW: 'login_flow',
  FORM_VALIDATION: 'form_validation',
  CRUD_OPERATION: 'crud_operation',
  API_ENDPOINT: 'api_endpoint',
  UI_NAVIGATION: 'ui_navigation',
  CUSTOM: 'custom'
};

export const STATUS_COLORS = {
  pass: 'bg-green-100 text-green-800',
  fail: 'bg-red-100 text-red-800',
  blocked: 'bg-yellow-100 text-yellow-800',
  skipped: 'bg-gray-100 text-gray-800',
  Open: 'bg-yellow-100 text-yellow-800',
  Fixed: 'bg-blue-100 text-blue-800',
  Verified: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800'
};

export const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  major: 'bg-orange-100 text-orange-800',
  minor: 'bg-yellow-100 text-yellow-800',
  trivial: 'bg-blue-100 text-blue-800'
};

export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};
