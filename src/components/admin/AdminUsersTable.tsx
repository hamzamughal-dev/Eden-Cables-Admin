"use client";

import React, { useState, useMemo } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  Calendar,
  Mail,
} from "lucide-react";

export function AdminUsersTable() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    users,
    total,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = useAdminUsers();

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <Card className="w-full border-slate-200 dark:border-slate-800 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-base font-bold">Registered Users Directory</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Read-only directory of all customer and administrative accounts
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading && users.length === 0}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 transition-colors"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 px-3 text-xs gap-1.5 shrink-0 cursor-pointer"
              title="Refresh users list"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-emerald-500" : ""}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 1. ERROR STATE */}
        {isError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                Failed to Load Users
              </h4>
              <p className="text-xs text-rose-500/80 mt-1 max-w-md mx-auto">
                {errorMessage || "An error occurred while fetching registered users."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs border-rose-500/40 hover:bg-rose-500/10 cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* 2. LOADING STATE (Skeleton Rows) */}
        {isLoading && (
          <div className="space-y-3 py-2">
            <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-slate-100/70 dark:bg-slate-800/40 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-slate-100/70 dark:bg-slate-800/40 animate-pulse" />
            <div className="h-14 w-full rounded-lg bg-slate-100/70 dark:bg-slate-800/40 animate-pulse" />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!isLoading && !isError && filteredUsers.length === 0 && (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {searchQuery ? "No matching users found" : "No registered users found"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? `No user records matched "${searchQuery}". Try a different keyword.`
                  : "Registered user accounts will automatically appear in this directory."}
              </p>
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-xs text-emerald-600 hover:text-emerald-500 cursor-pointer"
              >
                Clear Search Filter
              </Button>
            )}
          </div>
        )}

        {/* 4. SUCCESS TABLE DATA */}
        {!isLoading && !isError && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pl-2 font-medium">User Profile</th>
                  <th className="pb-3 font-medium">Email Address</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Registration Date</th>
                  <th className="pb-3 text-right pr-2 font-medium">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            }`}
                          >
                            {u.name ? u.name.slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-white">
                              {u.name || "Unnamed User"}
                            </div>
                            <span className="text-[11px] text-slate-400 block sm:hidden">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {u.email}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5">
                        <Badge
                          variant={isAdmin ? "warning" : "info"}
                          className="capitalize text-[10px] font-semibold gap-1"
                        >
                          {isAdmin ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <UserCheck className="h-3 w-3" />
                          )}
                          {u.role}
                        </Badge>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(u.created_at)}
                        </span>
                      </td>

                      {/* Safe User ID */}
                      <td className="py-3.5 pr-2 text-right">
                        <span
                          className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800"
                          title={u.id}
                        >
                          {u.id.slice(0, 8)}...
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table Footer count */}
            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span>
                Showing <strong>{filteredUsers.length}</strong> of <strong>{total}</strong> registered users
              </span>
              <span className="text-[11px] text-slate-400">
                Managed via useAdminUsers custom hook
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
