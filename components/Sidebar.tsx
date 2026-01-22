"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "./AuthProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Sales", href: "/sales", icon: ShoppingCart },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Users", href: "/users", icon: Users },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const role = user?.role || "viewer";
  const allowedPages = user?.allowedPages || ["/dashboard"];
  const userName = user?.name || "User";

  // Check if user has access to a page
  const hasAccess = (href: string): boolean => {
    if (role === "admin") return true;
    return allowedPages.includes(href);
  };

  // Get filtered nav items based on role
  const accessibleItems = navItems.filter((item) => hasAccess(item.href));

  // Handle navigation - close first, then navigate
  const handleNavClick = (href: string) => {
    setIsOpen(false); // Close sidebar immediately
    setTimeout(() => {
      router.push(href);
    }, 100); // Small delay to ensure close animation starts
  };

  // Handle close button
  const handleClose = () => {
    setIsOpen(false);
  };

  // Handle overlay click
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    setIsOpen(false);
    logout();
    setTimeout(() => {
      router.push("/login");
    }, 100);
  };

  // Check if route is active
  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay - Mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Genesis@1"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="font-bold text-gray-900">Genesis@1</h1>
                <p className="text-xs font-medium text-indigo-600">Hardware</p>
              </div>
            </div>
            
            {/* Close button - Mobile only */}
            <button
              type="button"
              onClick={handleClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {accessibleItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={active ? "text-white" : "text-gray-400"}
                    />
                    <span className="font-medium flex-1">{item.label}</span>
                    {active && <ChevronRight size={16} className="text-white/70" />}
                  </button>
                );
              })}
            </div>

            {/* Restricted Pages Notice */}
            {role !== "admin" && navItems.length > accessibleItems.length && (
              <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium">
                  Some pages are restricted. Contact admin for access.
                </p>
              </div>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 active:bg-red-100 border border-gray-200 hover:border-red-200 transition-all duration-200"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
