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
import { productSchema } from "@/validations/product";

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
      return sendBadRequest("Invalid product identifier format. Must be a valid UUID.");
    }

    const { data: product, error } = await supabase!
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
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return sendServerError(error, "Failed to retrieve product.");
    }

    if (!product) {
      return sendNotFound(`Product with ID '${id}' was not found.`);
    }

    return sendSuccess({ product }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving product.");
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
      return sendBadRequest("Invalid product identifier format. Must be a valid UUID.");
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return sendValidationError(null, "Invalid JSON payload.");
    }

    const validation = productSchema.safeParse(rawBody);
    if (!validation.success) {
      return sendValidationError(
        validation.error.flatten().fieldErrors,
        "Validation failed for product update."
      );
    }

    const updateData = validation.data;

    const { data: existingProduct, error: findError } = await supabase!
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to verify product existence.");
    }

    if (!existingProduct) {
      return sendNotFound(`Product with ID '${id}' was not found.`);
    }

    const { data: category, error: catError } = await supabase!
      .from("categories")
      .select("id")
      .eq("id", updateData.category_id)
      .maybeSingle();

    if (catError || !category) {
      return sendNotFound("The specified category does not exist.");
    }

    const { data: updatedProduct, error: updateError } = await supabase!
      .from("products")
      .update({
        name: updateData.name,
        description: updateData.description?.trim() || null,
        quantity: updateData.quantity,
        price: updateData.price,
        discount: updateData.discount,
        category_id: updateData.category_id,
      })
      .eq("id", id)
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
      .single();

    if (updateError) {
      return sendServerError(updateError, "Failed to update product.");
    }

    return sendSuccess({ product: updatedProduct }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error updating product.");
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
      return sendBadRequest("Invalid product identifier format. Must be a valid UUID.");
    }

    const { data: product, error: findError } = await supabase!
      .from("products")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to check product existence.");
    }

    if (!product) {
      return sendNotFound(`Product with ID '${id}' was not found.`);
    }

    const { count: requestCount, error: countError } = await supabase!
      .from("product_requests")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (countError) {
      return sendServerError(countError, "Failed to verify product request references.");
    }

    if (requestCount && requestCount > 0) {
      return sendConflict(
        `Cannot delete product "${product.name}" because it is referenced by ${requestCount} customer inquiry record${
          requestCount === 1 ? "" : "s"
        }. Deletion is prevented to preserve historical request and audit integrity.`,
        {
          productId: id,
          productName: product.name,
          referencingRequestsCount: requestCount,
        }
      );
    }

    // 3. Zero references exist: safe to delete
    const { error: deleteError } = await supabase!
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return sendServerError(deleteError, "Failed to delete product.");
    }

    return sendSuccess(
      {
        id,
        deleted: true,
        message: `Product "${product.name}" was successfully deleted.`,
      },
      200
    );
  } catch (err) {
    return sendServerError(err, "Unexpected error deleting product.");
  }
}
