"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import SyncIndicator from "./SyncIndicator";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Page titles mapping
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/sales": "Sales",
  "/reports": "Reports",
  "/users": "User Management",
};

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userName = user?.name || "User";
  const userRole = user?.role || "viewer";

  // Get current page title
  const pageTitle = pageTitles[pathname] || "Genesis@1";

  // Close sidebar when pathname changes (for navigation)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Open sidebar handler
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - pass setIsOpen directly */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={openSidebar}
                className="lg:hidden -ml-2 text-slate-600 hover:text-slate-900"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </Button>

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2">
                <img src="/logo.png" alt="Genesis@1" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-slate-900">Genesis@1</span>
              </div>

              {/* Desktop: Page title */}
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-slate-900">{pageTitle}</h1>
                <p className="text-sm text-slate-500">Welcome back, {userName.split(" ")[0]}</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-slate-700"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
              </Button>

              {/* User avatar (desktop) */}
              <div className="hidden lg:flex items-center gap-3 pl-3">
                <Separator orientation="vertical" className="h-8" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{userName}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-widest">
                    {userRole}
                  </Badge>
                </div>
                <Avatar>
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Mobile: Page title bar */}
          <div className="lg:hidden px-4 py-3 bg-slate-50 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{pageTitle}</h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-4 border-t border-slate-200 bg-white">
          <p className="text-center text-xs text-slate-500">
            © 2024 Genesis@1 Hardware. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Sync Indicator */}
      <SyncIndicator role={userRole} />
    </div>
  );
}
