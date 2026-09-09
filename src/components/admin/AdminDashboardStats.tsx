"use client";

import React from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Shield, RefreshCw } from "lucide-react";

export function AdminDashboardStats() {
  const { users, isLoading, isError, isFetching } = useAdminUsers();

  const totalUsers = users.length;
  const standardUsers = users.filter((u) => u.role === "user").length;
  const admins = users.filter((u) => u.role === "admin").length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse shadow-xs border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-8 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-20 bg-slate-100 dark:bg-slate-900 rounded" />
              </div>
              <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Registered Users
              </p>
              {isFetching && (
                <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
              )}
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isError ? "—" : totalUsers}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
              {isError ? "Failed to load" : "All registered accounts"}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Customer Accounts
            </p>
            <h3 className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
              {isError ? "—" : standardUsers}
            </h3>
            <span className="text-[11px] text-cyan-600/90 dark:text-cyan-400/90 font-medium mt-1 inline-block">
              Assigned role=&quot;user&quot;
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                System Administrators
              </p>
              <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                Single Admin
              </Badge>
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {isError ? "—" : admins}
            </h3>
            <span className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-medium mt-1 inline-block">
              Enforced by Database Partial Index
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Shield className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
