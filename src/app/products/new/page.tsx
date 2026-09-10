import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryRecord, WireTypeRecord } from "@/types/admin";

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

export default async function NewProductPage() {
  const { user, supabase } = await requireAdmin();

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
        title="Add Wire Specification / Dimension"
        subtitle="Select metal (Copper/Aluminum), core category, dimension (3/29, 7/29, etc.), rate, and upload product image"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <ProductForm
          categories={categories}
          wireTypes={wireTypes}
          mode="create"
        />
      </main>
    </>
  );
}
