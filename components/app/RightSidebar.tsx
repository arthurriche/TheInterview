'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_LINKS } from "@/lib/nav/appLinks";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function RightSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createSupabaseBrowserClient();

  // Sidebar is expanded if not collapsed OR if hovering
  const isExpanded = !collapsed || isHovering;

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav aria-label="Navigation principale" className="space-y-2">
      {APP_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 shadow-[inset_2px_2px_6px_rgba(79,70,229,0.2)]"
                : "text-[#6B7280] hover:bg-white/70 hover:text-[#2A2D3A] border border-transparent"
            )}
            title={!isExpanded ? link.label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {isExpanded && <span className="truncate">{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      window.location.href = "/";
    } catch (error) {
      console.error("[FinanceBro] Logout failed", error);
      toast.error("Impossible de se déconnecter. Réessaie.");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Left, Collapsable with hover expand */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-10 h-[calc(100vh-5rem)] rounded-[30px] border border-white/70 bg-[#F8F9FC]/90 backdrop-blur-sm transition-all duration-300 ease-in-out shadow-[25px_25px_60px_#C9CCD3,-25px_-25px_60px_#FFFFFF]",
          isExpanded ? "w-64" : "w-20"
        )}
        aria-label="Barre latérale de navigation"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex h-full flex-col p-4">
          {/* Header with collapse toggle */}
          <div className={cn("mb-6 flex items-center", isExpanded ? "justify-between" : "justify-center")}>
            {isExpanded && (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">FinanceBro</p>
                <h2 className="text-lg font-semibold text-[#2A2D3A] truncate">Espace membre</h2>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "rounded-xl p-2 text-[#6B7280] hover:bg-white hover:text-[#4F46E5] transition-colors",
                !isExpanded && "mx-auto"
              )}
              aria-label={collapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto pr-2">
            <SidebarContent />
          </div>

          <div className="mt-auto pt-6">
            <div className="border-t border-white/70 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-center gap-2 text-[#4F46E5] hover:bg-white/80",
                  !isExpanded && "px-2"
                )}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {isExpanded && <span>{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>}
              </Button>
            </div>

            {!isExpanded && (
              <div className="mt-4 flex justify-center">
                <div className="h-1 w-6 rounded-full bg-[#D1D4D9]" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <Button
          variant="secondary"
          size="sm"
          className="h-12 w-12 rounded-2xl p-0 shadow-[12px_12px_24px_rgba(209,212,217,0.8)]"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-white/70 bg-[#F8F9FC] shadow-[30px_30px_60px_rgba(201,204,211,0.9)]">
            <div className="flex items-center justify-between border-b border-white/70 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">FinanceBro</p>
                <h2 className="text-lg font-semibold text-[#2A2D3A]">Menu</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 text-[#6B7280] hover:bg-white hover:text-[#4F46E5] transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
            </div>
            <div className="border-t border-white/70 p-6">
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
