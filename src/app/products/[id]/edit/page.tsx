import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryRecord, ProductRecord } from "@/types/admin";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { user, supabase } = await requireAdmin();
  const { id } = await params;

  const { data: productData, error } = await supabase
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
      updated_at
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !productData) {
    notFound();
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, created_at, updated_at")
    .order("name", { ascending: true });

  const product = productData as ProductRecord;
  const categories = (categoriesData || []) as CategoryRecord[];

  return (
    <>
      <AdminHeader
        title={`Edit Product: ${product.name}`}
        subtitle="Update pricing, stock availability, specifications, or category"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <ProductForm
          initialProduct={product}
          categories={categories}
          mode="edit"
        />
      </main>
    </>
  );
}
