"use server";

import { getSession, login } from "@/lib/auth-utils";
import { runQuery } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

/**
 * Re-fetches the current user's data from Convex and updates their session cookie.
 * This is useful after permissions or roles have been changed.
 */
export async function refreshSession() {
    try {
        const session = await getSession();
        if (!session || !session.user?.id) {
            return { error: "No active session to refresh" };
        }

        console.log(`Refreshing session for user: ${session.user.id}`);

        // Fetch fresh data from Convex
        const user = await runQuery<any>(api.users.getById, { id: session.user.id });

        if (!user) {
            return { error: "User no longer exists" };
        }

        // Update the session cookie with new data
        await login({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            allowedPages: user.allowedPages,
        });

        console.log("Session refreshed successfully");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to refresh session:", error);
        return { error: error.message || "An unexpected error occurred during session refresh" };
    }
}
