import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryRecord } from "@/types/admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { user, supabase } = await requireAdmin();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, created_at, updated_at")
    .order("name", { ascending: true });

  const categories = (categoriesData || []) as CategoryRecord[];

  return (
    <>
      <AdminHeader
        title="Create New Product"
        subtitle="Add a new cable or network accessory to the enterprise catalog"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <ProductForm categories={categories} mode="create" />
      </main>
    </>
  );
}
