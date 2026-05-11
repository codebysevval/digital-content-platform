/**
 * Shared API client.
 *
 * Wraps the native fetch API with:
 *  - JSON request/response handling
 *  - Bearer token injection from localStorage
 *  - Centralized 401 handling that clears the token and broadcasts an
 *    `unauthorized` window event so the auth store can reset state.
 *  - Multipart upload helper for FormData payloads.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const TOKEN_STORAGE_KEY = 'sochen_token';

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    const isAuthEndpoint = path === '/api/auth/login' || path === '/api/auth/signup';
    if (!isAuthEndpoint && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('unauthorized'));
    }
    throw new Error(isAuthEndpoint ? 'E-posta veya şifre hatalı' : 'Oturum süresi doldu');
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({} as { message?: string }));
    throw new Error(
      (errorBody as { message?: string }).message ?? `HTTP ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: (path: string) => request<void>('DELETE', path),
  upload: async <T>(path: string, file: File): Promise<T> => {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({} as { message?: string }));
      throw new Error(
        (errorBody as { message?: string }).message ??
          `Upload failed: HTTP ${res.status}`,
      );
    }
    return res.json() as Promise<T>;
  },
};

export { BASE_URL as API_BASE_URL };

export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_URL}${path}`;
}
