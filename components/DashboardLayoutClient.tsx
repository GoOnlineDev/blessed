"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import SyncIndicator from "./SyncIndicator";
import { useAuth } from "./AuthProvider";
import DashboardHeader from "./DashboardHeader";
import MobileSidebar from "./MobileSidebar";

// Page titles mapping
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/sales": "Sales",
  "/reports": "Reports",
  "/users": "User Management",
};

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userName = user?.name || "User";
  const userRole = user?.role || "viewer";

  // Get current page title
  const pageTitle = pageTitles[pathname] || "Genesis@1";

  // Close sidebar when pathname changes (for navigation)
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const toggleSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
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
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader
          pageTitle={pageTitle}
          userName={userName}
          userRole={userRole}
          onOpenSidebar={toggleSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-4 border-t border-slate-200 bg-white">
          <p className="text-center text-xs text-slate-500">
            © 2026 Genesis@1 Hardware. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Sync Indicator */}
      <SyncIndicator role={userRole} />
    </div>
  );
}
