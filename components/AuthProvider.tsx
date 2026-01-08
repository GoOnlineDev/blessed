"use client";

import { createContext, useContext, ReactNode, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { refreshSession } from "@/app/actions/refresh_session";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    allowedPages: string[];
}

interface AuthContextType {
    user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ user: initialUser, children }: { user: User | null, children: ReactNode }) {
    // Live subscription to user data in Convex - Using email as it's a stable string in JWT
    const liveUser = useQuery(api.users.getByEmail, initialUser?.email ? { email: initialUser.email } : "skip");

    // Session Auto-Sync Effect
    useEffect(() => {
        if (!liveUser || !initialUser) return;

        // Check for mismatch between live data (Convex) and session data (JWT)
        const roleMismatch = liveUser.role !== initialUser.role;
        const pagesMismatch = JSON.stringify(liveUser.allowedPages) !== JSON.stringify(initialUser.allowedPages);

        if (roleMismatch || pagesMismatch) {
            console.warn(`AuthProvider: Session mismatch detected for ${liveUser.email}. Triggering auto-sync...`);
            console.log(" - Live Role:", liveUser.role, "vs Session Role:", initialUser.role);

            // Trigger server action to update the JWT cookie silently
            refreshSession().then(result => {
                if (result.success) {
                    console.log("AuthProvider: Session cookie successfully synced with Convex.");
                } else {
                    console.error("AuthProvider: Failed to auto-sync session cookie:", result.error);
                }
            });
        }
    }, [liveUser, initialUser]);

    useEffect(() => {
        if (liveUser) {
            console.log(`AuthProvider: [LIVE] Connected to Convex for: ${liveUser.email}. Current Role: ${liveUser.role}, Pages: ${liveUser.allowedPages.length}`);
        }
    }, [liveUser]);

    const activeUser = useMemo(() => {
        if (!liveUser) {
            if (initialUser) console.log(`AuthProvider: [SYNCING] Waiting for Convex... Falling back to session for: ${initialUser.email}`);
            return initialUser;
        }

        return {
            id: liveUser._id,
            name: liveUser.name,
            email: liveUser.email,
            role: liveUser.role as any,
            allowedPages: liveUser.allowedPages,
        };
    }, [liveUser, initialUser]);

    return (
        <AuthContext.Provider value={{ user: activeUser }}>
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
