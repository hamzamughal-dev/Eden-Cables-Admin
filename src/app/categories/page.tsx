import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { CategoryRecord, WireTypeRecord } from "@/types/admin";

interface CategoryWithProductCount extends CategoryRecord {
  product_count?: number;
}

export const dynamic = "force-dynamic";

const FALLBACK_WIRE_TYPES: WireTypeRecord[] = [
  {
    id: "copper",
    name: "Copper",
    description: "Electrolytic Grade Pure Copper",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "aluminum",
    name: "Aluminum",
    description: "EC Grade High Conductivity Aluminum",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function AdminCategoriesPage() {
  const { user, supabase } = await requireAdmin();

  // 1. Fetch Wire Types / Metals
  let wireTypes: WireTypeRecord[] = [];
  const { data: wtData } = await supabase
    .from("wire_types")
    .select("id, name, description, created_at, updated_at")
    .order("name", { ascending: true });

  wireTypes = (wtData && wtData.length > 0) ? wtData : FALLBACK_WIRE_TYPES;

  // 2. Fetch Categories with wire_type relation if available
  let categories: CategoryWithProductCount[] = [];
  const { data: categoriesData, error: catErr } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      description,
      wire_type_id,
      created_at,
      updated_at,
      wire_types (
        id,
        name
      ),
      products (
        count
      )
    `
    )
    .order("name", { ascending: true });

  if (!catErr && categoriesData) {
    categories = (categoriesData || []).map((cat: any) => {
      const wt = Array.isArray(cat.wire_types) ? cat.wire_types[0] : cat.wire_types;
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        wire_type_id: cat.wire_type_id || null,
        wire_type: wt || null,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        product_count: Array.isArray(cat.products)
          ? cat.products[0]?.count || 0
          : cat.products?.count || 0,
      };
    });
  } else {
    // Fallback without wire_types relation
    const { data: fallbackData } = await supabase
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

    categories = (fallbackData || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      wire_type_id: null,
      wire_type: null,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
      product_count: Array.isArray(cat.products)
        ? cat.products[0]?.count || 0
        : cat.products?.count || 0,
    }));
  }

  return (
    <>
      <AdminHeader
        title="Wire Metals & Core Categories"
        subtitle="Manage metals (Copper, Aluminum) and core categories (Single Core, Double Core, etc.)"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <CategoryTable
          initialCategories={categories}
          wireTypes={wireTypes}
        />
      </main>
    </>
  );
}
