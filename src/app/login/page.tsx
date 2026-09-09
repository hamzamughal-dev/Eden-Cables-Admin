"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminLoginMutation } from "@/hooks/useAuth";
import { Logo } from "@/components/shared/Logo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginInput } from "@/validations/auth";
import { getSafeRedirectUrl } from "@/lib/utils";
import { ShieldAlert, ArrowRight, AlertCircle, ShieldCheck, Lock } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirectTo");
  const accessDenied = searchParams.get("error") === "access_denied";
  const redirectTo = getSafeRedirectUrl(rawRedirectTo, "/dashboard");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const adminLoginMutation = useAdminLoginMutation({
    onSuccess: () => {
      router.push(redirectTo);
      router.refresh();
    },
  });

  const onSubmit = (data: LoginInput) => {
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/5 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo href="/login" badge="Admin" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-[#e01b22]/30 bg-[#e01b22]/10 text-[#e01b22] text-xs font-mono font-semibold mt-3">
            <ShieldAlert className="h-3.5 w-3.5 text-[#e01b22]" />
            Restricted Operations Console
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900 mt-1">Eden Cables Control Desk</h2>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Authorized administrator credentials required. All authentication attempts are audited and logged.
          </p>
        </div>

        <div className="border border-slate-200 border-t-4 border-t-[#e01b22] bg-white rounded-xl shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Administrator Sign In</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only verified operations staff with role=&quot;admin&quot; can authenticate.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {accessDenied && !adminLoginMutation.isError && (
              <div className="flex items-start gap-2.5 rounded-[4px] border border-rose-500/30 bg-rose-50 p-3 text-xs text-rose-700">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Access Denied: Your account does not possess administrator privileges.
                </span>
              </div>
            )}

            {adminLoginMutation.isError && (
              <div className="flex items-start gap-2.5 rounded-[4px] border border-red-500/30 bg-red-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {(adminLoginMutation.error as Error)?.message ||
                    "Invalid administrator credentials."}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Admin Email Address
              </label>
              <input
                type="email"
                placeholder="admin@edencables.com"
                disabled={adminLoginMutation.isPending}
                {...register("email")}
                className="w-full px-3.5 py-2.5 text-xs rounded-[6px] border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e01b22] focus:ring-1 focus:ring-[#e01b22]"
              />
              {errors.email && (
                <p className="text-[11px] text-[#e01b22]">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                disabled={adminLoginMutation.isPending}
                {...register("password")}
                className="w-full px-3.5 py-2.5 text-xs rounded-[6px] border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#e01b22] focus:ring-1 focus:ring-[#e01b22]"
              />
              {errors.password && (
                <p className="text-[11px] text-[#e01b22]">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="red"
                className="w-full text-xs font-semibold py-3 gap-2 shadow-sm"
                isLoading={adminLoginMutation.isPending}
              >
                Authenticate as Admin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between w-full pt-3 text-[11px] text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#e01b22]" />
                MFA Enforced
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Lock className="h-3 w-3 text-[#e01b22]" />
                Single Admin Enforced
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
