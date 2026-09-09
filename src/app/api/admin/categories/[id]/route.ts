import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
  sendNotFound,
  sendConflict,
  sendBadRequest,
} from "@/lib/api/response";
import { categorySchema } from "@/validations/category";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return sendBadRequest("Invalid category identifier format. Must be a valid UUID.");
    }

    const { data: category, error } = await supabase!
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
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return sendServerError(error, "Failed to retrieve category.");
    }

    if (!category) {
      return sendNotFound(`Category with ID '${id}' was not found.`);
    }

    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      created_at: category.created_at,
      updated_at: category.updated_at,
      product_count: Array.isArray((category as any).products)
        ? (category as any).products[0]?.count || 0
        : (category as any).products?.count || 0,
    };

    return sendSuccess({ category: formattedCategory }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving category.");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return sendBadRequest("Invalid category identifier format. Must be a valid UUID.");
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
        "Validation failed for category update."
      );
    }

    const { name, description } = validation.data;
    const trimmedName = name.trim();

    const { data: existingCategory, error: findError } = await supabase!
      .from("categories")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to verify category existence.");
    }

    if (!existingCategory) {
      return sendNotFound(`Category with ID '${id}' was not found.`);
    }

    const { data: duplicateCategory, error: checkError } = await supabase!
      .from("categories")
      .select("id, name")
      .ilike("name", trimmedName)
      .neq("id", id)
      .maybeSingle();

    if (checkError) {
      return sendServerError(checkError, "Failed to verify category name uniqueness.");
    }

    if (duplicateCategory) {
      return sendConflict(
        `A category with the name "${duplicateCategory.name}" already exists. Category names must be unique.`
      );
    }

    const { data: updatedCategory, error: updateError } = await supabase!
      .from("categories")
      .update({
        name: trimmedName,
        description: description?.trim() || null,
      })
      .eq("id", id)
      .select("id, name, description, created_at, updated_at")
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        return sendConflict(`A category with the name "${trimmedName}" already exists.`);
      }
      return sendServerError(updateError, "Failed to update category.");
    }

    return sendSuccess({ category: updatedCategory }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error updating category.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return sendBadRequest("Invalid category identifier format. Must be a valid UUID.");
    }

    const { data: category, error: findError } = await supabase!
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to check category existence.");
    }

    if (!category) {
      return sendNotFound(`Category with ID '${id}' was not found.`);
    }

    const { count: productCount, error: countError } = await supabase!
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      return sendServerError(countError, "Failed to check referencing products.");
    }

    if (productCount && productCount > 0) {
      return sendConflict(
        `Cannot delete category "${category.name}" because it contains ${productCount} product${
          productCount === 1 ? "" : "s"
        }. Please reassign or delete these products before deleting this category to prevent broken catalog records.`,
        {
          categoryId: id,
          categoryName: category.name,
          referencingProductsCount: productCount,
        }
      );
    }

    // 3. Zero products belong to this category: safe to delete
    const { error: deleteError } = await supabase!
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return sendServerError(deleteError, "Failed to delete category.");
    }

    return sendSuccess(
      {
        id,
        deleted: true,
        message: `Category "${category.name}" was successfully deleted.`,
      },
      200
    );
  } catch (err) {
    return sendServerError(err, "Unexpected error deleting category.");
  }
}
