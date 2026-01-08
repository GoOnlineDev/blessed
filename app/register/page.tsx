"use client";

import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Package, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/UI";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError("");
    try {
      const result = await registerAction(formData);
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
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/50 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 blur-[130px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-6 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-4 border border-slate-50">
            <img src="/logo.png" alt="Blessed@1 Logo" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">System Init</h1>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">Initialize Instance</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <form action={handleSubmit} className="space-y-8 relative">
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] mb-2">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <ShieldCheck size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">Initial Setup</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                The first registered account will be granted <span className="text-slate-900 font-black">Admin</span> status to manage the system.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wide animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Secure Password</label>
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
                  <span className="uppercase tracking-widest">Deploying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
                  Initialize Account
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Existing Operator?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-black transition-colors ml-1">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
