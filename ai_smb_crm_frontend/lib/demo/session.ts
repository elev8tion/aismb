export const DEMO_COOKIE = 'aismb-demo-session';

export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@kre8tion.com',
  name: 'KRE8TION Demo',
};

export function isDemoUser(user: { id?: string } | null | undefined): boolean {
  return user?.id === DEMO_USER.id;
}

export const DEMO_AGENT_DISABLED = 'Agent is not available in the public demo';

export function demoSessionPayload() {
  return {
    user: DEMO_USER,
    session: { id: 'demo-session', userId: DEMO_USER.id },
  };
}
