import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navItems } from "./Sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const role = user?.role || "viewer";
  const allowedPages = user?.allowedPages || ["/dashboard"];
  const userName = user?.name || "User";

  const hasAccess = (href: string): boolean => {
    if (role === "admin") return true;
    return allowedPages.includes(href);
  };

  const accessibleItems = navItems.filter((item) => hasAccess(item.href));

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false);
    setTimeout(() => {
      router.push("/login");
    }, 100);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Genesis@1"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="font-bold text-gray-900">Genesis@1</h1>
                <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-widest">
                  Hardware
                </Badge>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-slate-500 hover:text-slate-700"
              aria-label="Close menu"
            >
              <X size={20} />
            </Button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {accessibleItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    type="button"
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-4 py-3 text-left font-medium transition-all duration-200",
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-600"
                        : "text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 w-full"
                      onClick={() => onOpenChange(false)}
                    >
                      <Icon size={20} className={active ? "text-white" : "text-slate-400"} />
                      <span className="font-medium flex-1">{item.label}</span>
                      {active && <ChevronRight size={16} className="text-white/70" />}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {role !== "admin" && navItems.length > accessibleItems.length && (
              <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs text-amber-700 font-medium">
                  Some pages are restricted. Contact admin for access.
                </p>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{userName}</p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
            </div>
            <Separator className="mb-3" />
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-center gap-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
