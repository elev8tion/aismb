// UI client actions — return directives for the client to adjust UI state

type Scope = 'leads' | 'contacts' | 'companies' | 'pipeline' | 'bookings' | 'partnerships' | 'drafts' | 'voice_sessions' | 'roi_calculations' | 'reports_weekly' | 'settings';

type UIAction = 'set_filter' | 'search' | 'open_new' | 'open_edit' | 'open_view';

const SUPPORTED_ACTIONS: Record<Scope, readonly UIAction[]> = {
  leads: ['set_filter', 'search', 'open_new', 'open_edit', 'open_view'],
  contacts: ['search', 'open_new', 'open_edit'],
  companies: ['open_new', 'open_view'],
  pipeline: ['open_new', 'open_view'],
  bookings: ['set_filter', 'search', 'open_view'],
  partnerships: ['open_edit', 'open_view'],
  drafts: ['set_filter', 'search', 'open_new', 'open_edit', 'open_view'],
  voice_sessions: ['set_filter', 'search', 'open_view'],
  roi_calculations: ['set_filter', 'search', 'open_view'],
  reports_weekly: [],
  settings: [],
};

function unsupported(scope: Scope, action: UIAction) {
  return {
    ok: false,
    error: `The ${action} action is not supported on the ${scope} page`,
  };
}

function supports(scope: Scope, action: UIAction) {
  return SUPPORTED_ACTIONS[scope].includes(action);
}

export async function ui_set_filter(
  params: { scope: Scope; filter: string },
  _cookiesOrUserId: string
) {
  if (!supports(params.scope, 'set_filter')) return unsupported(params.scope, 'set_filter');
  return {
    ok: true,
    client_action: {
      type: 'ui_action',
      scope: params.scope,
      action: 'set_filter',
      payload: { filter: params.filter },
    },
  };
}

export async function ui_search(
  params: { scope: Scope; query: string },
  _cookiesOrUserId: string
) {
  if (!supports(params.scope, 'search')) return unsupported(params.scope, 'search');
  return {
    ok: true,
    client_action: {
      type: 'ui_action',
      scope: params.scope,
      action: 'search',
      payload: { query: params.query },
    },
  };
}

export async function ui_open_new(
  params: { scope: Scope },
  _cookiesOrUserId: string
) {
  if (!supports(params.scope, 'open_new')) return unsupported(params.scope, 'open_new');
  return {
    ok: true,
    client_action: {
      type: 'ui_action',
      scope: params.scope,
      action: 'open_new',
    },
  };
}

export async function ui_open_edit(
  params: { scope: Scope; id?: string; query?: string },
  _cookiesOrUserId: string
) {
  if (!supports(params.scope, 'open_edit')) return unsupported(params.scope, 'open_edit');
  return {
    ok: true,
    client_action: {
      type: 'ui_action',
      scope: params.scope,
      action: 'open_edit',
      payload: { id: params.id, query: params.query },
    },
  };
}

export async function ui_open_view(
  params: { scope: Scope; id?: string; query?: string },
  _cookiesOrUserId: string
) {
  if (!supports(params.scope, 'open_view')) return unsupported(params.scope, 'open_view');
  return {
    ok: true,
    client_action: {
      type: 'ui_action',
      scope: params.scope,
      action: 'open_view',
      payload: { id: params.id, query: params.query },
    },
  };
}

