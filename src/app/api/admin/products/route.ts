import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
  sendNotFound,
} from "@/lib/api/response";
import { productSchema } from "@/validations/product";

export async function GET() {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const { data: products, error } = await supabase!
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

    if (error) {
      return sendServerError(error, "Failed to retrieve products.");
    }

    return sendSuccess({ products: products || [] }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving products.");
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

    const validation = productSchema.safeParse(rawBody);
    if (!validation.success) {
      return sendValidationError(
        validation.error.flatten().fieldErrors,
        "Validation failed for product creation."
      );
    }

    const productData = validation.data;

    const { data: category, error: catError } = await supabase!
      .from("categories")
      .select("id, name")
      .eq("id", productData.category_id)
      .maybeSingle();

    if (catError || !category) {
      return sendNotFound("The specified category does not exist.");
    }

    const { data: newProduct, error: insertError } = await supabase!
      .from("products")
      .insert({
        name: productData.name,
        description: productData.description?.trim() || null,
        quantity: productData.quantity,
        price: productData.price,
        discount: productData.discount,
        category_id: productData.category_id,
      })
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

    if (insertError) {
      return sendServerError(insertError, "Failed to create product in database.");
    }

    return sendSuccess({ product: newProduct }, 201);
  } catch (err) {
    return sendServerError(err, "Unexpected error creating product.");
  }
}
