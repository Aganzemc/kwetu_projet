import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken } from '../lib/api';
type User = { id: string; email: string } | null;
type Profile = any;

interface AuthContextType {
  user: User;
  profile: Profile | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const data = await api.me();
    setProfile(data?.data ?? null);
  };

  const updateOnlineStatus = async (_userId: string, isOnline: boolean) => {
    await api.updateMe({ is_online: isOnline });
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchProfile();
        setUser({ id: 'me', email: '' });
      } catch {}
      setLoading(false);
    })();

    const handleBeforeUnload = () => {
      if (user) {
        updateOnlineStatus(user.id, false as any);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (user) updateOnlineStatus(user.id, false as any);
    };
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await api.signup({ name, email, password });
      const loginRes = await api.login({ email, password });
      const token = loginRes?.data?.token;
      const user = loginRes?.data?.user;
      if (token) setToken(token);
      if (user) setUser({ id: String(user.id), email: user.email });
      // Mark online after successful auth
      try { await api.updateMe({ is_online: true }); } catch {}
      await fetchProfile();
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      const token = res?.data?.token;
      const user = res?.data?.user;
      if (token) setToken(token);
      if (user) setUser({ id: String(user.id), email: user.email });
      // Mark online after successful login
      try { await api.updateMe({ is_online: true }); } catch {}
      await fetchProfile();
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  // Heartbeat to keep user online while active
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      api.updateMe({ is_online: true }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const signOut = async () => {
    if (user) {
      await updateOnlineStatus(user.id, false as any);
    }
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      await api.updateMe(updates);
      await fetchProfile();
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
