import React, { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { AuthContext } from './useAuth'
import { authService, LoginResponse, AuthTokensResponse } from './authService'

// Exposed state shape (per requirements)
// isAuthenticated: boolean
// userRole: string | null ('admin' | 'employee' | etc.)
// accessToken: string | null
// Methods: login(email, password), verifyMfa(code), logout(), forgotPassword(email), resetPassword(token, newPassword)

// Context + hook defined in auth-core.js to satisfy react-refresh lint rule

const ACCESS_TOKEN_KEY = 'rs.accessToken'
const REFRESH_TOKEN_KEY = 'rs.refreshToken'
const ROLE_KEY = 'rs.userRole'

// Helper: decode JWT payload safely (no verification, just base64 decode)
interface DecodedJwtPayload { role?: string; exp?: number }
function decodeJwt(token: string | null | undefined): DecodedJwtPayload | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as DecodedJwtPayload
  } catch {
    return null
  }
}

// API base logic centralized in authService

export interface AuthContextValue {
  isAuthenticated: boolean
  userRole: string | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>
  verifyMfa: (code: string) => Promise<boolean>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

export interface AuthProviderProps { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(ACCESS_TOKEN_KEY))
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem(ROLE_KEY))
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)))

  // Internal MFA pending state (not part of required public state spec)
  const pendingUserIdRef = useRef<string | null>(null)
  const logoutTimerRef = useRef<number | null>(null)

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
  }, [])

  const clearSession = useCallback(() => {
    clearLogoutTimer()
    setAccessToken(null)
    setIsAuthenticated(false)
    setUserRole(null)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }, [clearLogoutTimer])

  // Persist changes
  useEffect(() => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    else localStorage.removeItem(ACCESS_TOKEN_KEY)
  }, [accessToken])

  useEffect(() => {
    if (userRole) localStorage.setItem(ROLE_KEY, userRole)
    else localStorage.removeItem(ROLE_KEY)
  }, [userRole])

  const applyAuthTokens = useCallback((token: string | null, refreshToken?: string | null) => {
    if (!token) {
      clearSession()
      return
    }

    setAccessToken(token)
    setIsAuthenticated(true)

    if (typeof refreshToken !== 'undefined') {
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      else localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }, [clearSession])

  const login = useCallback(async (email: string, password: string): Promise<{ mfaRequired: boolean }> => {
    const data: LoginResponse = await authService.login(email, password)
    if ('mfaRequired' in data && data.mfaRequired) {
      pendingUserIdRef.current = data.userId
      return { mfaRequired: true }
    }
    const tokens = data as AuthTokensResponse
    if (tokens.accessToken) {
      applyAuthTokens(tokens.accessToken, tokens.refreshToken)
      return { mfaRequired: false }
    }
    throw new Error('Unexpected login response shape')
  }, [applyAuthTokens])

  const verifyMfa = useCallback(async (code: string): Promise<boolean> => {
    if (!pendingUserIdRef.current) throw new Error('No MFA challenge in progress')
    const data = await authService.verifyMfa(pendingUserIdRef.current, code)
    if ('accessToken' in data) {
      applyAuthTokens(data.accessToken, data.refreshToken)
      pendingUserIdRef.current = null
      return true
    }
    // enable flow returns { ok: boolean } but context verifyMfa is for login path; treat as error
    throw new Error('Unexpected MFA response for login flow')
  }, [applyAuthTokens])

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (refreshToken) {
        await authService.logout(refreshToken, accessToken || undefined)
      }
    } catch {
      // ignore network/logout errors
    }
    applyAuthTokens(null, null)
  }, [applyAuthTokens, accessToken])

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    await authService.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    await authService.resetPassword(token, newPassword)
  }, [])

  useEffect(() => {
    clearLogoutTimer()

    if (!accessToken) {
      setUserRole(null)
      return
    }

    const decoded = decodeJwt(accessToken)
    setUserRole(decoded?.role || null)

    const expSeconds = decoded?.exp
    if (!expSeconds) return

    const expiresInMs = expSeconds * 1000 - Date.now()
    if (expiresInMs <= 0) {
      clearSession()
      return
    }

    logoutTimerRef.current = window.setTimeout(() => {
      clearSession()
    }, expiresInMs)
  }, [accessToken, clearLogoutTimer, clearSession])

  const value: AuthContextValue = useMemo(() => ({
    isAuthenticated,
    userRole,
    accessToken,
    login,
    verifyMfa,
    logout,
    forgotPassword,
    resetPassword,
  }), [isAuthenticated, userRole, accessToken, login, verifyMfa, logout, forgotPassword, resetPassword])

  return (
  <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
