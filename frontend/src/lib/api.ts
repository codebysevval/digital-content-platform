const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

const AUTH_TOKEN_KEY = 'dcp_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(init.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = (await response.json()) as { message?: string };
      message = data.message ?? message;
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
