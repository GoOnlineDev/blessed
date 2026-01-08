"use server";

import { getSession } from "@/lib/auth-utils";

/**
 * Server action to get the current session.
 * Used by client components to re-sync their local state.
 */
export async function getCurrentSession() {
    const session = await getSession();
    return session;
}
