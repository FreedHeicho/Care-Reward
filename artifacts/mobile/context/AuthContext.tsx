import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  memberId: string;
  planName: string;
  pointsBalance: number;
  savingsThisYear: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePoints: (delta: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "@carereward_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((stored) => {
        if (stored) setUser(JSON.parse(stored));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, name: string) => {
    const derivedName = email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: User = {
      id: "usr-" + Date.now(),
      name: name.trim() || derivedName,
      email,
      memberId: "MBR-2024-8821",
      planName: "BlueCross PPO Gold",
      pointsBalance: 2450,
      savingsThisYear: 847,
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updatePoints = (delta: number) => {
    if (!user) return;
    const updated = {
      ...user,
      pointsBalance: Math.max(0, user.pointsBalance - delta),
    };
    setUser(updated);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updatePoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
