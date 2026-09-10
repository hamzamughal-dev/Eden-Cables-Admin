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

    const initialQuery = await supabase!
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
      .eq("id", id)
      .maybeSingle();

    let product: any = initialQuery.data;
    const error = initialQuery.error;

    if (error) {
      const fallback = await supabase!
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

      if (fallback.error) {
        return sendServerError(fallback.error, "Failed to retrieve product.");
      }
      product = fallback.data ? { ...fallback.data, dimension: null, image_url: null } : null;
    }

    if (!product) {
      return sendNotFound(`Product with ID '${id}' was not found.`);
    }

    const cat = Array.isArray(product.category) ? product.category[0] : product.category;
    const wt = cat?.wire_type ? (Array.isArray(cat.wire_type) ? cat.wire_type[0] : cat.wire_type) : null;

    const formatted = {
      id: product.id,
      name: product.name,
      dimension: product.dimension || null,
      description: product.description || null,
      image_url: product.image_url || null,
      quantity: product.quantity ?? 1000,
      price: Number(product.price),
      discount: Number(product.discount || 0),
      category_id: product.category_id,
      category: cat ? { ...cat, wire_type: wt } : null,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    return sendSuccess({ product: formatted }, 200);
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

    const updatePayload: Record<string, any> = {
      name: updateData.name.trim(),
      dimension: updateData.dimension?.trim() || null,
      description: updateData.description?.trim() || null,
      image_url: updateData.image_url?.trim() || null,
      price: updateData.price,
      category_id: updateData.category_id,
    };

    const updateRes = await supabase!
      .from("products")
      .update(updatePayload)
      .eq("id", id)
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
          name
        )
      `
      )
      .single();

    let updatedProduct: any = updateRes.data;
    let updateError = updateRes.error;

    if (updateError && (updateError.code === "42703" || updateError.message?.includes("does not exist"))) {
      delete updatePayload.dimension;
      delete updatePayload.image_url;

      const retry = await supabase!
        .from("products")
        .update(updatePayload)
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

      updatedProduct = retry.data;
      updateError = retry.error;
    }

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
        }. Deletion is prevented to preserve historical request integrity.`,
        {
          productId: id,
          productName: product.name,
          referencingRequestsCount: requestCount,
        }
      );
    }

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
