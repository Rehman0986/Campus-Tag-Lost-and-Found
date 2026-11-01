const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

export function getApiBase(): string {
  return API_BASE.replace(/\/$/, '');
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('campus_tag_access_token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  return fetch(`${getApiBase()}${path}`, { ...options, headers });
}

export async function loginAdmin(email: string, password: string): Promise<{ access: string; refresh: string }> {
  const res = await fetch(`${getApiBase()}/api/v1/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getCurrentUser(): Promise<any> {
  const res = await apiFetch('/api/v1/auth/me/');
  if (!res.ok) throw new Error('Failed to load user');
  return res.json();
}
