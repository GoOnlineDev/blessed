"use client";

import { clsx } from "clsx";
import { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 border-indigo-600",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm",
        danger: "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-transparent",
    };

    return (
        <button
            className={clsx(
                "px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 border flex items-center justify-center gap-2 text-sm",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
    return (
        <div className="space-y-2 w-full">
            {label && <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">{label}</label>}
            <input
                className={clsx(
                    "w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium",
                    className
                )}
                {...props}
            />
        </div>
    );
}
