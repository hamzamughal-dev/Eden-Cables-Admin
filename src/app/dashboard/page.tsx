import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardStatsGrid } from "@/components/admin/DashboardStatsGrid";
import { RecentRequestsCard } from "@/components/admin/RecentRequestsCard";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { Plus, Layers, ShoppingCart, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - Eden Cables Management Console",
  description: "Administrative console for managing products, categories, and customer quote inquiries",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { user, profile, supabase } = await requireAdmin();

  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: pendingRequestsCount },
    { count: totalRequestsCount },
    { data: recentRequestsData },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("product_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("product_requests")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("product_requests")
      .select(
        `
        id,
        full_name,
        phone,
        product_id,
        requirements,
        created_at,
        status,
        product:products (
          id,
          name,
          price,
          discount,
          category:categories (
            id,
            name
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const totalProducts = productsCount || 0;
  const totalCategories = categoriesCount || 0;
  const pendingRequests = pendingRequestsCount || 0;
  const totalRequests = totalRequestsCount || 0;
  const recentRequests = (recentRequestsData || []) as any[];

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="Operations Control Dashboard"
        subtitle={`Administrator: ${profile.name || "Operations Lead"}`}
        adminEmail={user.email || profile.email}
      />

      <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
        {/* KPI / Live Summary Statistics */}
        <section aria-label="Key Performance Indicators">
          <DashboardStatsGrid
            totalProducts={totalProducts}
            totalCategories={totalCategories}
            pendingRequests={pendingRequests}
            totalRequests={totalRequests}
          />
        </section>

        {/* Quick Management Shortcuts */}
        <section
          aria-label="Quick Management Actions"
          className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Catalog & Operations Shortcuts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access to create products, manage classifications, and process customer inquiries
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/products/new">
              <Button
                variant="emerald"
                size="sm"
                className="cursor-pointer gap-1.5 font-semibold text-xs shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </Button>
            </Link>

            <Link href="/categories">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-50"
              >
                <Layers className="h-3.5 w-3.5 text-slate-500" />
                <span>Categories</span>
              </Button>
            </Link>

            <Link href="/requests">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-50"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-slate-500" />
                <span>Inquiries</span>
                {pendingRequests > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-700 border border-amber-500/30 font-bold">
                    {pendingRequests}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </section>

        {/* Recent Product Inquiries Table / Feed */}
        <section aria-label="Recent Inquiries">
          <RecentRequestsCard recentRequests={recentRequests} />
        </section>
      </main>
    </div>
  );
}
