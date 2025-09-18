// Centralized Auth Service for backend communication (TypeScript + strict types)
// Endpoints covered: login, verifyMfa, refresh, logout, forgotPassword, resetPassword, enableMfa

// ---------- Response Type Definitions ----------
export interface LoginMfaRequiredResponse {
  mfaRequired: true;
  userId: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken?: string; // refresh absent on some flows (e.g., refresh endpoint only returns access)
}

export type LoginResponse = LoginMfaRequiredResponse | AuthTokensResponse;

export interface RefreshResponse {
  accessToken: string;
}

export interface OkResponse { ok: true }

export interface EnableMfaResponse {
  secret: string;
  otpauth: string;
  qr: string; // data URL (PNG base64)
}

export interface VerifyMfaEnableResponse { ok: boolean }

export type VerifyMfaLoginResponse = AuthTokensResponse;

export type VerifyMfaResponse = VerifyMfaEnableResponse | VerifyMfaLoginResponse;

// ---------- Request Payload Type Definitions ----------
interface JsonRequestOptions<TBody> {
  body?: TBody;
  headers?: Record<string, string>;
}

// Narrow extracted env var type
function getApiBase(): string {
  const base = (import.meta as any)?.env?.VITE_API_BASE as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  return base || 'http://localhost:5001';
}

async function jsonRequest<TResponse, TBody = unknown>(
  path: string,
  options: JsonRequestOptions<TBody> = {},
): Promise<TResponse> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`Request failed (${res.status}) ${detail}`.trim());
  }
  // Attempt JSON parse; if none, return empty object casted to TResponse.
  try {
    return (await res.json()) as TResponse;
  } catch {
    return {} as TResponse;
  }
}

// Optional: runtime type guards (lightweight examples)
function isLoginMfaRequired(r: unknown): r is LoginMfaRequiredResponse {
  return typeof r === 'object' && r !== null && (r as any).mfaRequired === true && typeof (r as any).userId === 'string'; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const resp = await jsonRequest<LoginResponse, { email: string; password: string }>(
      '/auth/login',
      { body: { email, password } },
    );
    // Basic structural sanity (can expand as needed)
    if (!isLoginMfaRequired(resp) && typeof resp.accessToken !== 'string') {
      throw new Error('Unexpected login response shape');
    }
    return resp;
  },

  async verifyMfa(
    userId: string,
    token: string,
    purpose?: 'enable' | 'login',
  ): Promise<VerifyMfaResponse> {
    return jsonRequest<VerifyMfaResponse, { userId: string; token: string; purpose?: 'enable' | 'login' }>(
      '/auth/verify-mfa',
      { body: { userId, token, purpose } },
    );
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return jsonRequest<RefreshResponse, { refreshToken: string }>(
      '/auth/refresh',
      { body: { refreshToken } },
    );
  },

  async logout(refreshToken: string, accessToken?: string): Promise<OkResponse> {
    return jsonRequest<OkResponse, { refreshToken: string }>(
      '/auth/logout',
      { body: { refreshToken }, headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined },
    );
  },

  async forgotPassword(email: string): Promise<OkResponse> {
    return jsonRequest<OkResponse, { email: string }>(
      '/auth/forgot-password',
      { body: { email } },
    );
  },

  async resetPassword(token: string, newPassword: string): Promise<OkResponse> {
    return jsonRequest<OkResponse, { token: string; newPassword: string }>(
      '/auth/reset-password',
      { body: { token, newPassword } },
    );
  },

  async enableMfa(accessToken: string): Promise<EnableMfaResponse> {
    return jsonRequest<EnableMfaResponse>('/auth/enable-mfa', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async me(accessToken: string): Promise<{ id: string; email: string; role: string; mfaEnabled: boolean; hasMfaSecret: boolean }> {
    return jsonRequest('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
} as const;

export type AuthService = typeof authService;
