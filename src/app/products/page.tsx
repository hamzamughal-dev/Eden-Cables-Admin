import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductTable } from "@/components/admin/ProductTable";
import { CategoryRecord, ProductRecord, WireTypeRecord } from "@/types/admin";

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

export default async function AdminProductsPage() {
  const { user, supabase } = await requireAdmin();

  // 1. Fetch Wire Types / Metals
  let wireTypes: WireTypeRecord[] = [];
  const { data: wtData } = await supabase
    .from("wire_types")
    .select("id, name, description, created_at, updated_at")
    .order("name", { ascending: true });
  
  wireTypes = (wtData && wtData.length > 0) ? wtData : FALLBACK_WIRE_TYPES;

  // 2. Fetch Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, description, wire_type_id, created_at, updated_at")
    .order("name", { ascending: true });

  const categories = (categoriesData || []) as CategoryRecord[];

  // 3. Fetch Products with rich fields
  let products: ProductRecord[] = [];
  const { data: productsData, error: prodErr } = await supabase
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
        wire_type_id,
        wire_type:wire_types (
          id,
          name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (!prodErr && productsData) {
    products = productsData as unknown as ProductRecord[];
  } else {
    // Fallback if dimension or wire_types columns aren't in table yet
    const { data: fallbackProds } = await supabase
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
    products = (fallbackProds || []) as unknown as ProductRecord[];
  }

  return (
    <>
      <AdminHeader
        title="Product & Dimension Specifications"
        subtitle="Manage wire metals (Copper & Aluminum), core categories, dimensions (e.g. 3/29, 7/29), rates, and imagery"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <ProductTable
          initialProducts={products}
          categories={categories}
          wireTypes={wireTypes}
        />
      </main>
    </>
  );
}
