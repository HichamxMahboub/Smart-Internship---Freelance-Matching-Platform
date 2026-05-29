import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { authService } from '../services/authService';
import { Role, User } from '../types';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; role: Role }) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refreshUser = useCallback(async () => {
    const backendUser = await authService.me();
    setUser(backendUser);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setInitializing(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async ({ email, password, fullName, role }: { email: string; password: string; fullName: string; role: Role }) => {
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const syncedUser = await authService.syncUser({ fullName, role });
    setUser(syncedUser.user);
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, initializing, login, register, refreshUser, logout }), [user, initializing, login, register, refreshUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
