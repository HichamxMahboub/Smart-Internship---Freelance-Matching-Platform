import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { Role, User } from '../types';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; role: Role }) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshVerification: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'interlance_demo_user';

const DEMO_USERS: Record<string, User> = {
  'candidate@interlance.demo': {
    id: 'seed-candidate-uid',
    firebaseUid: 'seed-candidate-uid',
    fullName: 'Candidate Interlance',
    email: 'candidate@interlance.demo',
    role: 'CANDIDATE',
    plan: 'FREE',
    active: true,
    emailVerified: true
  },
  'recruiter@interlance.demo': {
    id: 'seed-recruiter-uid',
    firebaseUid: 'seed-recruiter-uid',
    fullName: 'Recruiter Interlance',
    email: 'recruiter@interlance.demo',
    role: 'RECRUITER',
    plan: 'FREE',
    active: true,
    emailVerified: true
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refreshUser = useCallback(async () => {
    const backendUser = await authService.me();
    setUser(backendUser);
  }, []);

  useEffect(() => {
    const demoUserRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(DEMO_USER_STORAGE_KEY) : null;
    if (demoUserRaw) {
      try {
        setUser(JSON.parse(demoUserRaw));
      } catch {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        setUser(null);
      }
      setInitializing(false);
      return;
    }

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
    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS[normalizedEmail];

    if (password === 'demo123' && demoUser) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
      }
      setUser(demoUser);
      return;
    }

    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    try { await reload(credential.user); } catch { /* ignore network blip */ }
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async ({ email, password, fullName, role }: { email: string; password: string; fullName: string; role: Role }) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    try { await sendEmailVerification(credential.user); } catch { /* email send failure must not block signup */ }
    const syncedUser = await authService.syncUser({ fullName, role });
    setUser(syncedUser.user);
  }, []);

  const refreshVerification = useCallback(async () => {
    const current = firebaseAuth.currentUser;
    if (!current) return null;
    try {
      await reload(current);
      await current.getIdToken(true);
      const updated = await userService.refreshVerification();
      setUser(updated);
      return updated;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
    try {
      await signOut(firebaseAuth);
    } catch {
      // Demo mode may not have an active Firebase session.
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, refreshUser, refreshVerification, logout }),
    [user, initializing, login, register, refreshUser, refreshVerification, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
