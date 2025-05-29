import { createContext, useContext } from 'react';
import type { User } from '../../types/user';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  token: string | null;
  login: (nationalId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}