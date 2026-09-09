import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { CategoryRecord } from "@/types/admin";

interface CategoryWithProductCount extends CategoryRecord {
  product_count?: number;
}

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const { user, supabase } = await requireAdmin();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      description,
      created_at,
      updated_at,
      products (
        count
      )
    `
    )
    .order("name", { ascending: true });

  const categories = (categoriesData || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    created_at: cat.created_at,
    updated_at: cat.updated_at,
    product_count: Array.isArray(cat.products)
      ? cat.products[0]?.count || 0
      : cat.products?.count || 0,
  })) as CategoryWithProductCount[];

  return (
    <>
      <AdminHeader
        title="Category Management"
        subtitle="Create, update, and manage product categories across the catalog"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <CategoryTable initialCategories={categories} />
      </main>
    </>
  );
}
