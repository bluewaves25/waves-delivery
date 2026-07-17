import React, { createContext, useContext, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, setAuthToken } from '../api/client';

type AuthState = {
  token: string | null;
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      signIn: async (email, password) => {
        const data = await apiLogin(email, password);
        const accessToken = data.access_token || data.accessToken || data.token;
        if (!accessToken) {
          throw new Error('Login response missing token');
        }
        setAuthToken(accessToken);
        setToken(accessToken);
        setUser(data.user || data);
        try {
          await SecureStore.setItemAsync('rider_token', accessToken);
        } catch {
          // web / unsupported secure store
        }
      },
      signOut: async () => {
        setAuthToken(null);
        setToken(null);
        setUser(null);
        try {
          await SecureStore.deleteItemAsync('rider_token');
        } catch {
          // ignore
        }
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
