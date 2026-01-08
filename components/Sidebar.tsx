"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Users,
    Settings,
    LogOut,
    X
} from "lucide-react";
import { clsx } from "clsx";
import { logoutAction } from "@/app/actions/auth";
import { useAuth } from "./AuthProvider";

interface NavItem {
    label: string;
    href: string;
    icon: any;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/inventory", icon: Package },
    { label: "Sales", href: "/sales", icon: ShoppingCart },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Users", href: "/users", icon: Users },
];

export default function Sidebar({
    isOpen,
    onClose
}: {
    isOpen: boolean,
    onClose: () => void
}) {
    const pathname = usePathname();
    const { user } = useAuth();

    const role = user?.role || "viewer";
    const allowedPages = user?.allowedPages || [];
    const userName = user?.name || "User";

    useEffect(() => {
        if (isOpen) {
            onClose();
        }
    }, [pathname]);
    // Filter items based on allowedPages
    const filteredItems = navItems.filter(item => {
        // Strict permission check: is this path specifically allowed?
        const isAllowed = allowedPages.some(page => {
            const match = item.href === page || (item.href !== "/dashboard" && item.href.startsWith(page));
            return match;
        });
        return isAllowed;
    });

    if (user) {
        console.log(`Sidebar [RE-RENDER]: User: ${user.email}, Role: ${user.role}, Visible Items: ${filteredItems.length}, Allowed:`, user.allowedPages);
    }

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <div className={clsx(
                "w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 flex flex-col pt-8 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-50 transition-all duration-300",
                "lg:translate-x-0",
                isOpen ? "translate-x-0 visible opacity-100" : "-translate-x-full invisible lg:visible lg:opacity-100"
            )}>
                <div className="px-6 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <img src="/logo.png" alt="Blessed@1 Hardware" className="h-9 w-9 flex-shrink-0 rounded-lg" />
                        <div className="min-w-0">
                            <span className="text-lg font-black text-slate-900 tracking-tight leading-none block truncate">Blessed@1</span>
                            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5 block">Hardware</span>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 lg:hidden flex-shrink-0"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1.5">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold"
                                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
                                )}
                            >
                                <item.icon className={clsx(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                                )} />
                                <span>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                {userName[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => await logoutAction()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl transition-all duration-200 border border-slate-200 hover:border-rose-100 font-semibold text-sm shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
