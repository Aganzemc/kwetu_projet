const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type ApiUser = { id: string; email: string };

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
}

export const api = {
  // auth
  signup: (payload: { email: string; password: string; firstName?: string; lastName?: string }) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  // profiles
  me: () => request('/profiles/me'),
  updateMe: (updates: any) => request('/profiles/me', { method: 'PATCH', body: JSON.stringify(updates) }),
  listProfiles: () => request('/profiles'),

  // groups
  listGroups: () => request('/groups'),

  // messages
  listMessages: (params: { peerId?: string; groupId?: string }) => {
    const q = new URLSearchParams();
    if (params.peerId) q.set('peerId', params.peerId);
    if (params.groupId) q.set('groupId', params.groupId);
    return request(`/messages?${q.toString()}`);
  },
  sendMessage: (payload: any) => request('/messages', { method: 'POST', body: JSON.stringify(payload) }),
};


