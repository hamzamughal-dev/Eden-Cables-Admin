import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Database, Lock, Server } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = {
  title: "Admin System & Security Settings - Eden Cables",
};

export default async function AdminSettingsPage() {
  const { user, profile } = await requireAdmin();

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="System & Security Settings"
        subtitle="Global platform security and administrative access controls"
        adminEmail={user.email || profile.email}
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#e01b22]" />
                <CardTitle className="text-base text-slate-900">Access Control Policies</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Single administrator security enforcement rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Single Administrator Index</span>
                  <Badge variant="emerald">Active</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  PostgreSQL partial unique index guarantees that only 1 administrator account can exist in public.profiles.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Client-Controlled Roles</span>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Client requests cannot assign or elevate roles. User App registrations automatically assign role=&quot;user&quot;.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Admin Signup Capability</span>
                  <Badge variant="destructive">Disabled</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  No signup route exists in the Admin Application. Admin accounts are managed directly via Supabase Auth.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-600" />
                <CardTitle className="text-base text-slate-900">Infrastructure & Backend</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Shared Supabase database architecture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Supabase Project</span>
                  <span className="font-mono text-cyan-600 font-bold text-[11px]">vfmlyvgatmsjaoysyqtp</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Shared between User App and Admin App with unified authentication.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Row Level Security (RLS)</span>
                  <Badge variant="emerald">Enforced</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  PostgreSQL RLS policies protect public.profiles against cross-tenant data leaks.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Deployment Separation</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                    <Server className="h-3 w-3" /> Independent Vercel App
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Isolated repository and build pipeline completely segregated from the customer portal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
