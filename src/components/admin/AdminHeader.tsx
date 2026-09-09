"use client";

import React from "react";
import { ShieldCheck, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLogoutAction } from "@/lib/auth/admin";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  adminEmail?: string;
  action?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, adminEmail, action }: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await adminLogoutAction();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
      <div className="pl-10 lg:pl-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">
            {title}
          </h1>
          <span className="gap-1 hidden sm:inline-flex text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e01b22] text-white px-2 py-0.5 rounded-[4px]">
            <Shield className="h-3 w-3 inline mr-1 -mt-0.5" />
            Admin Console
          </span>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {adminEmail && (
          <div className="hidden md:flex items-center gap-2 rounded-[6px] bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-[#e01b22]" />
            <span className="font-mono text-[11px]">{adminEmail}</span>
          </div>
        )}

        {action}

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          isLoading={isLoggingOut}
          className="text-xs text-slate-700 hover:text-white hover:bg-[#e01b22] hover:border-[#e01b22] border-slate-300 bg-white gap-1.5 cursor-pointer disabled:opacity-50"
          title="Sign out of Admin Console"
        >
          {!isLoggingOut && <LogOut className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Logout"}</span>
        </Button>
      </div>
    </header>
  );
}
