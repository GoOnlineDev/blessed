"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X, Package } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: {
        name: string;
        role: string;
        allowedPages?: string[];
    };
}

export default function DashboardLayoutClient({ children, user: initialUser }: DashboardLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

    // Fallback to initialUser if the context isn't ready or user is null (though should be handled by middleware)
    const activeUser = user || initialUser;

    console.log("DashboardLayoutClient: Active user data:", {
        source: user ? 'Context' : 'Props',
        name: activeUser.name,
        role: activeUser.role,
        pages: activeUser.allowedPages
    });

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-slate-900 font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex flex-col lg:pl-64 min-h-screen">
                {/* Mobile Header - Strictly hidden on LG and up */}
                <header className="lg:hidden flex h-14 bg-white border-b border-slate-100 items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                        <img src="/logo.png" alt="Blessed@1" className="h-7 w-7 flex-shrink-0 rounded-md" />
                        <span className="font-black text-slate-900 tracking-tight text-sm truncate uppercase">Blessed@1 Hardware</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                        aria-label="Open menu"
                    >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Menu</span>
                        <Menu size={22} />
                    </button>
                </header>


                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto pt-2 lg:pt-4">
                        <header className="hidden lg:flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    Welcome back, {activeUser.name?.split(" ")[0]}
                                </h1>
                                <p className="text-slate-600 mt-1 font-medium">Monitoring your hardware ecosystem today.</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="h-10 w-px bg-slate-200" />
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">{activeUser.name}</p>
                                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">{activeUser.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shadow-sm">
                                    {activeUser.name?.[0].toUpperCase()}
                                </div>
                            </div>
                        </header>

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
