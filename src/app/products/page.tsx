import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductTable } from "@/components/admin/ProductTable";
import { CategoryRecord, ProductRecord } from "@/types/admin";

interface ProductWithCategory extends ProductRecord {
  category?: {
    id: string;
    name: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { user, supabase } = await requireAdmin();

  const { data: productsData } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      quantity,
      price,
      discount,
      category_id,
      created_at,
      updated_at,
      category:categories (
        id,
        name
      )
    `
    )
    .order("created_at", { ascending: false });

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, created_at, updated_at")
    .order("name", { ascending: true });

  const products = (productsData || []) as unknown as ProductWithCategory[];
  const categories = (categoriesData || []) as CategoryRecord[];

  return (
    <>
      <AdminHeader
        title="Product Catalog"
        subtitle="Manage inventory, pricing, discounts, and product categories"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <ProductTable
          initialProducts={products}
          categories={categories}
        />
      </main>
    </>
  );
}
