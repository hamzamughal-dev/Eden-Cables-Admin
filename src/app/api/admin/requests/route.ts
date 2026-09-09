import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { sendSuccess, sendServerError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");

    let query = supabase!
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

    if (
      statusFilter &&
      statusFilter !== "all" &&
      ["pending", "contacted", "completed", "cancelled"].includes(statusFilter)
    ) {
      query = query.eq("status", statusFilter);
    }

    const { data: requests, error } = await query;

    if (error) {
      return sendServerError(error, "Failed to retrieve product requests.");
    }

    const { data: allRequestsForCount, error: countError } = await supabase!
      .from("product_requests")
      .select("status");

    const counts = {
      all: 0,
      pending: 0,
      contacted: 0,
      completed: 0,
      cancelled: 0,
    };

    if (!countError && allRequestsForCount) {
      counts.all = allRequestsForCount.length;
      allRequestsForCount.forEach((req) => {
        const s = req.status as keyof typeof counts;
        if (s in counts) {
          counts[s] = (counts[s] || 0) + 1;
        }
      });
    }

    return sendSuccess(
      {
        requests: requests || [],
        counts,
      },
      200
    );
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving product requests.");
  }
}
