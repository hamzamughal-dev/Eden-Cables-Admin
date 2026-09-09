import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RequestsTable } from "@/components/admin/RequestsTable";
import { ProductRequestRecord } from "@/types/admin";

interface ExtendedProductRequest extends ProductRequestRecord {
  product?: {
    id?: string;
    name: string;
    price: number;
    discount: number;
    quantity?: number;
    category?: {
      id?: string;
      name: string;
    };
  };
}

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const { user, supabase } = await requireAdmin();

  const { data: requestsData } = await supabase
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
        quantity,
        category:categories (
          id,
          name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  const requests = (requestsData || []) as unknown as ExtendedProductRequest[];

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    completed: requests.filter((r) => r.status === "completed").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
  };

  return (
    <>
      <AdminHeader
        title="Product Inquiries & Requests"
        subtitle="Manage customer quote requests, update processing stages, and review specifications"
        adminEmail={user.email}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <RequestsTable initialRequests={requests} initialCounts={counts} />
      </main>
    </>
  );
}
