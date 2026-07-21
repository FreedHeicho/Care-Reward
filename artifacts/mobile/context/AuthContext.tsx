import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  ApiError,
  RedemptionWindowData,
  authApi,
  clearStoredToken,
  getStoredToken,
  storeToken,
  userApi,
} from "@/services/api";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  pointsBalance: number;
  earnedThisYear: number;
  planName: string;
  memberId: string;
  redemptionWindow: RedemptionWindowData | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  refreshUserContext: () => Promise<void>;
  updatePoints: (delta: number) => void;
  resetPoints: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CACHED_USER_KEY = "@cr_user";

function buildUser(
  base: { id: string; email: string; firstName: string; lastName: string; role?: string },
  context: {
    points?: { account: { currentBalance: number; earnedThisYear: number } | null } | null;
    activeRedemptionWindow?: RedemptionWindowData | null;
    insurancePlan?: { planName: string } | null;
  },
): User {
  return {
    id: base.id,
    email: base.email,
    firstName: base.firstName,
    lastName: base.lastName,
    name: `${base.firstName} ${base.lastName}`.trim(),
    role: base.role ?? "user",
    pointsBalance: context.points?.account?.currentBalance ?? 0,
    earnedThisYear: context.points?.account?.earnedThisYear ?? 0,
    planName: context.insurancePlan?.planName ?? "Health Plan",
    memberId: base.id.slice(0, 8).toUpperCase(),
    redemptionWindow: context.activeRedemptionWindow ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserContext = useCallback(async (): Promise<boolean> => {
    try {
      const ctx = await userApi.getContext();
      const enriched = buildUser(ctx.user, ctx);
      setUser(enriched);
      await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(enriched));
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await clearStoredToken();
        await AsyncStorage.removeItem(CACHED_USER_KEY);
        setUser(null);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken();
        if (!token) {
          const cached = await AsyncStorage.getItem(CACHED_USER_KEY);
          if (cached) setUser(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
        const cached = await AsyncStorage.getItem(CACHED_USER_KEY);
        if (cached) setUser(JSON.parse(cached));
        await loadUserContext();
      } catch {
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadUserContext]);

  const signIn = async (email: string, password: string): Promise<void> => {
    const res = await authApi.login(email, password);
    await storeToken(res.accessToken);
    const ctx = await userApi.getContext();
    const enriched = buildUser(ctx.user, ctx);
    setUser(enriched);
    await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(enriched));
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> => {
    const res = await authApi.register(email, password, firstName, lastName);
    await storeToken(res.accessToken);
    const ctx = await userApi.getContext();
    const enriched = buildUser(ctx.user, ctx);
    setUser(enriched);
    await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(enriched));
  };

  const signOut = async (): Promise<void> => {
    await clearStoredToken();
    await AsyncStorage.removeItem(CACHED_USER_KEY);
    setUser(null);
  };

  const refreshUserContext = async (): Promise<void> => {
    await loadUserContext();
  };

  const updatePoints = (delta: number): void => {
    setUser((prev) =>
      prev
        ? { ...prev, pointsBalance: Math.max(0, prev.pointsBalance - delta) }
        : null,
    );
  };

  const resetPoints = (): void => {
    loadUserContext();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        register,
        refreshUserContext,
        updatePoints,
        resetPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
