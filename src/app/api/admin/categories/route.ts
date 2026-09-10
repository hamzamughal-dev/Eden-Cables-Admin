import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
  sendConflict,
} from "@/lib/api/response";
import { categorySchema } from "@/validations/category";

export async function GET(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const searchParams = request.nextUrl.searchParams;
    const wireTypeId = searchParams.get("wire_type_id");

    // Try selecting with wire_types relation
    let query = supabase!
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

    if (wireTypeId && wireTypeId !== "all") {
      query = query.eq("wire_type_id", wireTypeId);
    }

    const { data: categories, error } = await query;

    // If wire_types relation fails due to pending migration, fall back to standard select
    if (error) {
      const { data: fallbackCats, error: fallbackErr } = await supabase!
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

      if (fallbackErr) {
        return sendServerError(fallbackErr, "Failed to retrieve categories.");
      }

      const formattedFallback = (fallbackCats || []).map((cat: any) => ({
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

      return sendSuccess({ categories: formattedFallback }, 200);
    }

    const formattedCategories = (categories || []).map((cat: any) => {
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

    return sendSuccess({ categories: formattedCategories }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving categories.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return sendValidationError(null, "Invalid JSON payload.");
    }

    const validation = categorySchema.safeParse(rawBody);
    if (!validation.success) {
      return sendValidationError(
        validation.error.flatten().fieldErrors,
        "Validation failed for category creation."
      );
    }

    const { name, description, wire_type_id } = validation.data;
    const trimmedName = name.trim();

    // Check duplicate name under same wire_type_id
    let checkQuery = supabase!
      .from("categories")
      .select("id, name, wire_type_id")
      .ilike("name", trimmedName);

    if (wire_type_id) {
      checkQuery = checkQuery.eq("wire_type_id", wire_type_id);
    }

    const { data: existingCategory } = await checkQuery.maybeSingle();

    if (existingCategory) {
      return sendConflict(
        `A category with the name "${existingCategory.name}" already exists in this wire metal.`
      );
    }

    // Try inserting with wire_type_id
    const insertPayload: Record<string, any> = {
      name: trimmedName,
      description: description?.trim() || null,
    };
    if (wire_type_id) {
      insertPayload.wire_type_id = wire_type_id;
    }

    const insertRes = await supabase!
      .from("categories")
      .insert(insertPayload)
      .select("id, name, description, wire_type_id, created_at, updated_at")
      .single();

    let newCategory: any = insertRes.data;
    let insertError = insertRes.error;

    // If error because wire_type_id column doesn't exist yet, retry without wire_type_id
    if (insertError && (insertError.message?.includes("wire_type_id") || insertError.code === "42703")) {
      delete insertPayload.wire_type_id;
      const retry = await supabase!
        .from("categories")
        .insert(insertPayload)
        .select("id, name, description, created_at, updated_at")
        .single();
      newCategory = retry.data;
      insertError = retry.error;
    }

    if (insertError) {
      if (insertError.code === "23505") {
        return sendConflict(`A category with the name "${trimmedName}" already exists.`);
      }
      return sendServerError(insertError, "Failed to create category in database.");
    }

    return sendSuccess({ category: newCategory }, 201);
  } catch (err) {
    return sendServerError(err, "Unexpected error creating category.");
  }
}
