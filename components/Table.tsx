"use client";

import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Table({ headers, children }: {
    headers: (string | { label: string, className?: string })[];
    children: ReactNode;
}) {
    return (
        <div className="w-full overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-0">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {headers.map((h, i) => {
                                const label = typeof h === "string" ? h : h.label;
                                const className = typeof h === "string" ? "" : h.className;
                                return (
                                    <th key={i} className={cn(
                                        "px-3 sm:px-5 lg:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-600 whitespace-nowrap",
                                        className
                                    )}>
                                        {label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TableRow({ children, onClick, className }: { children: ReactNode, onClick?: () => void, className?: string }) {
    return (
        <tr
            onClick={onClick}
            className={cn(
                "group transition-all duration-200",
                onClick ? "cursor-pointer hover:bg-slate-50" : "",
                className
            )}
        >
            {children}
        </tr>
    );
}

export function TableCell({ children, className, colSpan }: { children: ReactNode, className?: string, colSpan?: number }) {
    return (
        <td
            colSpan={colSpan}
            className={cn("px-3 sm:px-5 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-600", className)}
        >
            {children}
        </td>
    );
}
