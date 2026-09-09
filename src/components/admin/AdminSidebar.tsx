"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_SECTIONS } from "@/lib/constants/navigation";
import { Logo } from "@/components/shared/Logo";
import { NavIcon } from "@/components/shared/NavIcon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { adminLogoutAction } from "@/lib/auth/admin";

interface AdminSidebarProps {
  adminUser?: {
    name: string;
    email: string;
  };
}

export function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await adminLogoutAction();
    } finally {
      window.location.href = "/login";
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const adminName = adminUser?.name || "Administrator";
  const adminEmail = adminUser?.email || "admin@edencables.com";
  const initials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-white text-slate-700 border-r border-slate-200">
      <div className="space-y-6">
        {/* Brand & Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <Logo href="/dashboard" badge="Admin" />
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {ADMIN_NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {section.title && (
                <h4 className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </h4>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center justify-between rounded-[6px] px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-[#e01b22] text-white font-semibold shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <NavIcon
                          name={item.iconName}
                          className={cn(
                            "h-4 w-4 transition-colors",
                            active
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-700"
                          )}
                        />
                        <span>{item.title}</span>
                      </div>

                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || "default"}
                          className="text-[10px] px-1.5 py-0 font-bold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-[6px] bg-[#e01b22] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                {adminName}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[130px] font-mono">
                {adminEmail}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-1.5 text-slate-400 hover:text-[#e01b22] transition-colors cursor-pointer disabled:opacity-50"
            title="Log out as Admin"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-[6px] bg-white text-slate-700 border border-slate-200 shadow-sm cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
