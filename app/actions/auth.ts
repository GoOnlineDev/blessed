"use server";

import { runQuery, runMutation } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { login, logout } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        console.log(`Login attempt for: ${email}`);
        const user = await runQuery<any>(api.users.getByEmail, { email });

        if (!user) {
            return { error: "Invalid email or password" };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return { error: "Invalid email or password" };
        }

        await login({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            allowedPages: user.allowedPages,
        });
    } catch (error: any) {
        console.error("Login failed:", error);
        return { error: error.message || "An error occurred during login" };
    }

    redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required" };
    }

    try {
        console.log(`Registering: ${email}`);

        // Check connectivity/existence first
        console.log("Checking if user exists...");
        const existing = await runQuery<any>(api.users.getByEmail, { email });
        if (existing) {
            return { error: "User already exists" };
        }

        console.log("Hashing password...");
        const passwordHash = await bcrypt.hash(password, 10);

        console.log("Invoking Convex mutation...");
        const userId = await runMutation<any>(api.users.create, {
            name,
            email,
            passwordHash,
        });

        console.log(`User created: ${userId}`);

        // Fetch user data for the session
        const user = await runQuery<any>(api.users.getById, { id: userId });

        if (user) {
            console.log("Setting session...");
            await login({
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                allowedPages: user.allowedPages,
            });
        }
    } catch (error: any) {
        console.error("Registration fatal error:", error);
        const userFriendlyMessage = error.message?.includes("fetch failed")
            ? "Connection to database failed. Please check your internet or try again later."
            : error.message || "An error occurred during registration";
        return { error: userFriendlyMessage };
    }

    redirect("/dashboard");
}

export async function logoutAction() {
    await logout();
    redirect("/login");
}
