"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/UI";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "genesis_auth_user";

export default function RegisterPage() {
  const register = useMutation(api.users.register);
  const login = useMutation(api.users.login);
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Register the user
      await register({ name, email, password });

      // Then login to get the full user data
      const result = await login({ email, password });

      // Store in localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userId: result.userId,
          name: result.name,
          email: result.email,
          role: result.role,
          allowedPages: result.allowedPages,
        })
      );

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error?.message || "Registration failed. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/50 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-6 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-4 border border-slate-50">
            <img src="/logo.png" alt="Genesis@1 Logo" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Create account
            </h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">
              Genesis@1 Inventory
            </p>
          </div>
          </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] mb-2">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                The first account created becomes{" "}
                <span className="text-slate-900 font-black">Admin</span>.
              </p>
          </div>

              {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wide animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="e.g. joel@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={4}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
                </div>
              </div>

            <Button
                type="submit"
                disabled={isPending}
              className="w-full py-5 rounded-2xl text-base font-black shadow-xl shadow-indigo-100 mt-4 active:scale-[0.98] transition-all"
            >
              {isPending ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="uppercase tracking-widest">Creating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
            </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-black transition-colors ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
