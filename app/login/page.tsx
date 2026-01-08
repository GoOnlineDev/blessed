"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Package, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button, Input } from "@/components/UI";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError("");
    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      }
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setError(error?.message || "Something went wrong. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50/50 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-6 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-4 border border-slate-50">
            <img src="/logo.png" alt="Blessed@1 Logo" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Blessed@1</h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">Hardware Inventory</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <form action={handleSubmit} className="space-y-8 relative">
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Welcome Back</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Please enter your credentials to proceed.</p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wide animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Institutional Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="account@blessed1.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Secure Password</label>
                  <a href="#" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">Recover</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                  <input
                    name="password"
                    type="password"
                    required
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
                  <span className="uppercase tracking-widest">Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
                  Launch System
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              New Administrator?{" "}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-black transition-colors ml-1">
                Initialize Site
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
