import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Layers, Clock, ShoppingCart, ArrowRight, Zap } from "lucide-react";

interface DashboardStatsGridProps {
  totalProducts: number;
  totalCategories: number;
  pendingRequests: number;
  totalRequests: number;
}

export function DashboardStatsGrid({
  totalProducts,
  totalCategories,
  pendingRequests,
  totalRequests,
}: DashboardStatsGridProps) {
  const stats = [
    {
      title: "Wire Specifications",
      value: totalProducts,
      subtitle: "Dimensions (3/29, 7/29, etc.)",
      href: "/products",
      icon: Package,
      iconBg: "bg-red-500/10 text-[#e01b22] border-red-500/20",
      cta: "Manage Dimensions",
    },
    {
      title: "Core Categories",
      value: totalCategories,
      subtitle: "Single, Double, 3-Core, 4-Core",
      href: "/categories",
      icon: Layers,
      iconBg: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      cta: "Manage Categories",
    },
    {
      title: "Pending Inquiries",
      value: pendingRequests,
      subtitle:
        pendingRequests > 0
          ? "Quote requests awaiting response"
          : "All quote inquiries addressed",
      href: "/requests",
      icon: Clock,
      iconBg:
        pendingRequests > 0
          ? "bg-amber-500/15 text-amber-600 border-amber-500/30 animate-pulse"
          : "bg-slate-100 text-slate-500 border-slate-200",
      badge:
        pendingRequests > 0 ? (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
            Action Needed
          </Badge>
        ) : (
          <Badge variant="emerald" className="text-[10px] px-1.5 py-0">
            Clear
          </Badge>
        ),
      cta: "Review Pending",
    },
    {
      title: "Total Inquiries",
      value: totalRequests,
      subtitle: "Commercial & project inquiries",
      href: "/requests",
      icon: ShoppingCart,
      iconBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      cta: "View All Inquiries",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <Link key={idx} href={stat.href} className="group block">
            <Card className="h-full border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {stat.title}
                      </p>
                      {stat.badge}
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${stat.iconBg}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 text-[11px] truncate">
                    {stat.subtitle}
                  </span>
                  <span className="text-[#e01b22] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
                    <span>{stat.cta}</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
