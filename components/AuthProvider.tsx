"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedPages: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string, userData: Omit<User, "id">) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "genesis_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStoredUserId(parsed.userId);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  // Query user data if we have a stored userId
  const userData = useQuery(
    api.users.getById,
    storedUserId ? { id: storedUserId as Id<"users"> } : "skip"
  );

  const isLoading = !isInitialized || (storedUserId !== null && userData === undefined);

  const user: User | null = userData
    ? {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        allowedPages: userData.allowedPages,
      }
    : null;

  const login = useCallback((userId: string, userData: Omit<User, "id">) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, ...userData }));
    setStoredUserId(userId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStoredUserId(null);
  }, []);

  // If user was deleted from DB, clear local storage
  useEffect(() => {
    if (isInitialized && storedUserId && userData === null) {
      logout();
    }
  }, [isInitialized, storedUserId, userData, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
