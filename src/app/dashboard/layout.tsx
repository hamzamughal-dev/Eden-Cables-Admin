import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar
        adminUser={{
          name: profile.name || "Administrator",
          email: user.email || profile.email || "admin@edencables.com",
        }}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
