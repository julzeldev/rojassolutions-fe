import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './useAuth.js'

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
function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function getApiBase() {
  return (import.meta?.env?.VITE_API_BASE) || 'http://localhost:5001'
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY))
  const [userRole, setUserRole] = useState(() => localStorage.getItem(ROLE_KEY))
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)))

  // Internal MFA pending state (not part of required public state spec)
  const pendingUserIdRef = useRef(null)

  // Persist changes
  useEffect(() => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    else localStorage.removeItem(ACCESS_TOKEN_KEY)
  }, [accessToken])

  useEffect(() => {
    if (userRole) localStorage.setItem(ROLE_KEY, userRole)
    else localStorage.removeItem(ROLE_KEY)
  }, [userRole])

  const applyAuthTokens = useCallback((token, refreshToken) => {
    setAccessToken(token)
    setIsAuthenticated(Boolean(token))
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    else localStorage.removeItem(REFRESH_TOKEN_KEY)
    if (token) {
      const decoded = decodeJwt(token)
      const role = decoded?.role || null
      setUserRole(role)
    } else {
      setUserRole(null)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    if (data.mfaRequired) {
      pendingUserIdRef.current = data.userId
      // Do not set authenticated yet
      return { mfaRequired: true }
    }
    if (data.accessToken) {
      applyAuthTokens(data.accessToken, data.refreshToken)
      return { mfaRequired: false }
    }
    throw new Error('Unexpected login response')
  }, [applyAuthTokens])

  const verifyMfa = useCallback(async (code) => {
    if (!pendingUserIdRef.current) throw new Error('No MFA challenge in progress')
    const res = await fetch(`${getApiBase()}/auth/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: pendingUserIdRef.current, token: code }),
    })
    if (!res.ok) throw new Error('MFA verification failed')
    const data = await res.json()
    if (data.accessToken) {
      applyAuthTokens(data.accessToken, data.refreshToken)
      pendingUserIdRef.current = null
      return true
    }
    throw new Error('Unexpected MFA response')
  }, [applyAuthTokens])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (refreshToken) {
        await fetch(`${getApiBase()}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch {
      // ignore network/logout errors
    }
    applyAuthTokens(null, null)
  }, [applyAuthTokens])

  const forgotPassword = useCallback(async (email) => {
    const res = await fetch(`${getApiBase()}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error('Request failed')
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    const res = await fetch(`${getApiBase()}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })
    if (!res.ok) throw new Error('Reset failed')
  }, [])

  const value = useMemo(() => ({
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

