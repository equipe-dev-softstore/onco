'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface AuthUser { id: string; nome: string; email: string; role: string; }
interface AuthContextType { user: AuthUser | null; loading: boolean; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/auth/me')
      .then(res => {
        if (res) {
          // Aceita { success: true, data: user } OU o objeto user direto
          const userData = res.data || (res.id ? res : null);
          setUser(userData);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    // Limpa o cookie localmente primeiro para ser instantâneo
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
