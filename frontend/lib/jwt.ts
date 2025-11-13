export type JwtPayload = {
  sub?: string | number;
  username?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1];
    // Try Node Buffer first (SSR), then browser atob
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BufferAny: any = (global as unknown as { Buffer?: unknown }).Buffer;
      if (BufferAny) {
        const json = BufferAny.from(base64, 'base64').toString('utf8');
        return JSON.parse(json);
      }
    } catch {
      // ignore and fallback to atob
    }
    try {
      // atob is available in browsers
      const json = typeof atob === 'function' ? atob(base64) : '';
      return json ? (JSON.parse(json) as JwtPayload) : null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}
