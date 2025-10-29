import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { AuthContext } from "./useAuth";
import {
  authService,
  LoginResponse,
  AuthTokensResponse,
} from "./authService";

const ACCESS_TOKEN_KEY = "rs.accessToken";
const REFRESH_TOKEN_KEY = "rs.refreshToken";
const ROLE_KEY = "rs.userRole";
const PENDING_MFA_KEY = "rs.pendingMfa";
const PRE_AUTH_TOKEN_KEY = "rs.preAuthToken";
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;
const MIN_REFRESH_DELAY_MS = 5 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

interface DecodedJwtPayload {
  role?: string;
  exp?: number;
}
function decodeJwt(token: string | null | undefined): DecodedJwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

export type LoginResult =
  | { status: "authenticated" }
  | { status: "mfa-required"; userId: string }
  | { status: "mfa-setup"; preAuthToken: string };

interface PendingMfaChallenge {
  userId: string;
  email: string;
}

interface PendingSetupChallenge {
  preAuthToken: string;
  email: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  userRole: string | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeTotpLogin: (code: string) => Promise<boolean>;
  completeRecoveryLogin: (email: string, code: string) => Promise<boolean>;
  cancelMfaChallenge: () => void;
  pendingMfa: PendingMfaChallenge | null;
  preAuthToken: string | null;
  clearPreAuthToken: () => void;
  pendingSetup: PendingSetupChallenge | null;
  finalizeTotpSetup: (code: string) => Promise<string[]>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [userRole, setUserRole] = useState<string | null>(() =>
    localStorage.getItem(ROLE_KEY)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  );

  const [pendingMfa, setPendingMfa] = useState<PendingMfaChallenge | null>(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_MFA_KEY);
      return raw ? (JSON.parse(raw) as PendingMfaChallenge) : null;
    } catch {
      return null;
    }
  });

  const [pendingSetup, setPendingSetup] = useState<PendingSetupChallenge | null>(() => {
    try {
      const raw = sessionStorage.getItem(PRE_AUTH_TOKEN_KEY);
      return raw ? (JSON.parse(raw) as PendingSetupChallenge) : null;
    } catch {
      return null;
    }
  });
  const logoutTimerRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearLogoutTimer();
    clearInactivityTimer();
    clearRefreshTimer();
    isRefreshingRef.current = false;
    setAccessToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setPendingMfa(null);
    setPendingSetup(null);
    sessionStorage.removeItem(PENDING_MFA_KEY);
    sessionStorage.removeItem(PRE_AUTH_TOKEN_KEY);
  }, [clearInactivityTimer, clearLogoutTimer, clearRefreshTimer]);

  useEffect(() => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, [accessToken]);

  useEffect(() => {
    if (userRole) localStorage.setItem(ROLE_KEY, userRole);
    else localStorage.removeItem(ROLE_KEY);
  }, [userRole]);

  useEffect(() => {
    if (pendingMfa) sessionStorage.setItem(PENDING_MFA_KEY, JSON.stringify(pendingMfa));
    else sessionStorage.removeItem(PENDING_MFA_KEY);
  }, [pendingMfa]);

  useEffect(() => {
    if (pendingSetup) sessionStorage.setItem(PRE_AUTH_TOKEN_KEY, JSON.stringify(pendingSetup));
    else sessionStorage.removeItem(PRE_AUTH_TOKEN_KEY);
  }, [pendingSetup]);

  const applyAuthTokens = useCallback(
    (token: string | null, refreshToken?: string | null) => {
      if (!token) {
        clearSession();
        return;
      }

      setAccessToken(token);
      setIsAuthenticated(true);
      setPendingMfa(null);
      setPendingSetup(null);

      if (typeof refreshToken !== "undefined") {
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        else localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    },
    [clearSession]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const trimmedEmail = email.trim();
      const data: LoginResponse = await authService.login(trimmedEmail, password);

      if ('requiresMfa' in data && data.requiresMfa) {
        setPendingMfa({ userId: data.userId, email: trimmedEmail });
        setPendingSetup(null);
        return { status: 'mfa-required', userId: data.userId };
      }

      if ('requiresMfaSetup' in data && data.requiresMfaSetup) {
        setPendingMfa(null);
        setPendingSetup({ preAuthToken: data.preAuthToken, email: trimmedEmail });
        return { status: 'mfa-setup', preAuthToken: data.preAuthToken };
      }

      const tokens = data as AuthTokensResponse;
      if (tokens.accessToken) {
        applyAuthTokens(tokens.accessToken, tokens.refreshToken);
        return { status: 'authenticated' };
      }
      throw new Error('Unexpected login response shape');
    },
    [applyAuthTokens]
  );

  const cancelMfaChallenge = useCallback(() => {
    setPendingMfa(null);
    sessionStorage.removeItem(PENDING_MFA_KEY);
  }, []);

  const completeTotpLogin = useCallback(
    async (code: string): Promise<boolean> => {
      if (!pendingMfa) {
        throw new Error('No MFA challenge in progress');
      }
      const response = await authService.verifyTotpLogin(pendingMfa.userId, code.trim());
      if (response?.accessToken) {
        applyAuthTokens(response.accessToken, response.refreshToken);
        setPendingMfa(null);
        return true;
      }
      throw new Error('Unexpected MFA response for login flow');
    },
    [applyAuthTokens, pendingMfa]
  );

  const completeRecoveryLogin = useCallback(
    async (email: string, recoveryCode: string): Promise<boolean> => {
      const response = await authService.recoveryLogin(email.trim(), recoveryCode.trim());
      if (response?.accessToken) {
        applyAuthTokens(response.accessToken, response.refreshToken);
        setPendingMfa(null);
        return true;
      }
      throw new Error('Unexpected recovery login response');
    },
    [applyAuthTokens]
  );

  const clearPreAuthToken = useCallback(() => {
    setPendingSetup(null);
    sessionStorage.removeItem(PRE_AUTH_TOKEN_KEY);
  }, []);

  const finalizeTotpSetup = useCallback(
    async (code: string): Promise<string[]> => {
      if (!pendingSetup?.preAuthToken) {
        throw new Error('No MFA setup in progress');
      }
      const response = await authService.verifyTotpSetup(
        pendingSetup.preAuthToken,
        code.trim(),
      );
      applyAuthTokens(response.accessToken, response.refreshToken);
      setPendingSetup(null);
      sessionStorage.removeItem(PRE_AUTH_TOKEN_KEY);
      return response.recoveryCodes ?? [];
    },
    [applyAuthTokens, pendingSetup],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authService.logout(refreshToken, accessToken || undefined);
      }
    } catch {
      // ignore network/logout errors
    }
    applyAuthTokens(null, null);
  }, [applyAuthTokens, accessToken]);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    await authService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      await authService.resetPassword(token, newPassword);
    },
    []
  );

  const refreshAccessToken = useCallback(async () => {
    if (isRefreshingRef.current) return;
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefresh) {
      clearSession();
      return;
    }

    isRefreshingRef.current = true;
    try {
      const data = (await authService.refresh(
        storedRefresh
      )) as AuthTokensResponse | null;
      if (data?.accessToken) {
        applyAuthTokens(data.accessToken, data.refreshToken);
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [applyAuthTokens, clearSession]);

  const scheduleRefresh = useCallback(
    (expiresInMs: number) => {
      clearRefreshTimer();
      const refreshDelay = Math.max(
        expiresInMs - TOKEN_REFRESH_MARGIN_MS,
        MIN_REFRESH_DELAY_MS
      );
      refreshTimerRef.current = window.setTimeout(() => {
        void refreshAccessToken();
      }, refreshDelay);
    },
    [clearRefreshTimer, refreshAccessToken]
  );

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(() => {
      void logout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, logout]);

  const handleActivity = useCallback(() => {
    if (!isAuthenticated) return;
    startInactivityTimer();
  }, [isAuthenticated, startInactivityTimer]);

  useEffect(() => {
    clearLogoutTimer();
    clearRefreshTimer();

    if (!accessToken) {
      setUserRole(null);
      return;
    }

    const decoded = decodeJwt(accessToken);
    setUserRole(decoded?.role || null);

    const expSeconds = decoded?.exp;
    if (!expSeconds) return;

    const expiresInMs = expSeconds * 1000 - Date.now();
    if (expiresInMs <= 0) {
      clearSession();
      return;
    }

    scheduleRefresh(expiresInMs);
    logoutTimerRef.current = window.setTimeout(() => {
      clearSession();
    }, expiresInMs);
  }, [
    accessToken,
    clearLogoutTimer,
    clearRefreshTimer,
    clearSession,
    scheduleRefresh,
  ]);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated,
      userRole,
      accessToken,
      login,
      completeTotpLogin,
      completeRecoveryLogin,
      cancelMfaChallenge,
      pendingMfa,
      preAuthToken: pendingSetup?.preAuthToken ?? null,
      clearPreAuthToken,
      pendingSetup,
      finalizeTotpSetup,
      logout,
      forgotPassword,
      resetPassword,
    }),
    [
      isAuthenticated,
      userRole,
      accessToken,
      login,
      completeTotpLogin,
      completeRecoveryLogin,
      cancelMfaChallenge,
      pendingMfa,
      pendingSetup,
      clearPreAuthToken,
      finalizeTotpSetup,
      logout,
      forgotPassword,
      resetPassword,
    ]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInactivityTimer();
      return;
    }

    startInactivityTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInactivityTimer();
    };
  }, [
    isAuthenticated,
    clearInactivityTimer,
    handleActivity,
    startInactivityTimer,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
