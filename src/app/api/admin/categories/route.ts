import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
  sendConflict,
} from "@/lib/api/response";
import { categorySchema } from "@/validations/category";

export async function GET() {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const { data: categories, error } = await supabase!
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

    if (error) {
      return sendServerError(error, "Failed to retrieve categories.");
    }

    const formattedCategories = (categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
      product_count: Array.isArray(cat.products)
        ? cat.products[0]?.count || 0
        : cat.products?.count || 0,
    }));

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

    const { name, description } = validation.data;
    const trimmedName = name.trim();

    const { data: existingCategory, error: checkError } = await supabase!
      .from("categories")
      .select("id, name")
      .ilike("name", trimmedName)
      .maybeSingle();

    if (checkError) {
      return sendServerError(checkError, "Failed to verify category name uniqueness.");
    }

    if (existingCategory) {
      return sendConflict(
        `A category with the name "${existingCategory.name}" already exists. Category names must be unique.`
      );
    }

    const { data: newCategory, error: insertError } = await supabase!
      .from("categories")
      .insert({
        name: trimmedName,
        description: description?.trim() || null,
      })
      .select("id, name, description, created_at, updated_at")
      .single();

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
