import { useState, useCallback } from 'react';
import { mockAuthorize } from '../api/authService';
import type { User } from '../types/user';

type AuthUser = Omit<User, 'password'>;

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth-user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth-token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (nationalId: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mockAuthorize(nationalId, password);
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('auth-user', JSON.stringify(res.user));
        localStorage.setItem('auth-token', res.token);
        setLoading(false);
        return true;
      } else {
        setError(res.error || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch {
      setError('Unexpected error');
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
  }, []);

  return { user, token, loading, error, login, logout, isAuthenticated: !!user };
}
