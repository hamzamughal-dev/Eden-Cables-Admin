import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryRecord, ProductRecord, WireTypeRecord } from "@/types/admin";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

const FALLBACK_WIRE_TYPES: WireTypeRecord[] = [
  {
    id: "copper",
    name: "Copper",
    description: "Electrolytic Grade Copper",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "aluminum",
    name: "Aluminum",
    description: "EC Grade Aluminum",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { user, supabase } = await requireAdmin();
  const { id } = await params;

  let product: ProductRecord | null = null;

  const { data: productData, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      dimension,
      description,
      image_url,
      quantity,
      price,
      discount,
      category_id,
      created_at,
      updated_at,
      category:categories (
        id,
        name,
        wire_type_id
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!error && productData) {
    product = productData as unknown as ProductRecord;
  } else {
    // Fallback if dimension or image_url columns aren't in table yet
    const { data: fallbackData } = await supabase
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

    if (!fallbackData) {
      notFound();
    }
    product = fallbackData as ProductRecord;
  }

  const { data: wtData } = await supabase
    .from("wire_types")
    .select("id, name, description, created_at, updated_at")
    .order("name", { ascending: true });

  const wireTypes = (wtData && wtData.length > 0) ? wtData : FALLBACK_WIRE_TYPES;

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, wire_type_id, created_at, updated_at")
    .order("name", { ascending: true });

  const categories = (categoriesData || []) as CategoryRecord[];

  return (
    <>
      <AdminHeader
        title={`Edit Specification: ${product.dimension || product.name}`}
        subtitle="Update wire dimensions, core category, unit rate, and product image"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <ProductForm
          initialProduct={product}
          categories={categories}
          wireTypes={wireTypes}
          mode="edit"
        />
      </main>
    </>
  );
}
