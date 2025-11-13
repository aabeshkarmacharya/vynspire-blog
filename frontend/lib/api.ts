// Choose API base depending on runtime:
// - On the server (SSR or Node), prefer INTERNAL_API_BASE (service name in docker compose)
// - On the client (browser), use NEXT_PUBLIC_API_BASE
const isServer = typeof window === 'undefined';
const INTERNAL_BASE = process.env.INTERNAL_API_BASE;
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
export const API_BASE: string = isServer ? (INTERNAL_BASE || PUBLIC_BASE) : PUBLIC_BASE;

type HeadersInitLike = HeadersInit | Record<string, string> | undefined;

function buildHeaders(token?: string | null, extra: HeadersInitLike = {}): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(extra as Record<string, string>) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handle(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const message = isJson && data && (data.error as string) ? data.error : res.statusText;
    const err: any = new Error(message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiGet(path: string, token?: string | null, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: buildHeaders(token, init.headers),
    ...init,
  });
  return handle(res);
}

export async function apiPost(path: string, body?: unknown, token?: string | null, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(token, init.headers),
    body: JSON.stringify(body ?? {}),
    ...init,
  });
  return handle(res);
}

export async function apiPut(path: string, body?: unknown, token?: string | null, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: buildHeaders(token, init.headers),
    body: JSON.stringify(body ?? {}),
    ...init,
  });
  return handle(res);
}

export async function apiDelete(path: string, token?: string | null, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(token, init.headers),
    ...init,
  });
  return handle(res);
}
