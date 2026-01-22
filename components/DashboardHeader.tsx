import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface DashboardHeaderProps {
  pageTitle: string;
  userName: string;
  userRole: string;
  onOpenSidebar: () => void;
}

export default function DashboardHeader({
  pageTitle,
  userName,
  userRole,
  onOpenSidebar,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
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
  );
}
