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

    // Attempt rich query with dimension, image_url, category, and wire_types
    let { data: products, error } = await supabase!
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
      .order("created_at", { ascending: false });

    // Fallback if dimension/image_url/wire_types columns haven't been migrated yet
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
        .order("created_at", { ascending: false });

      if (fallback.error) {
        return sendServerError(fallback.error, "Failed to retrieve products.");
      }
      products = (fallback.data || []).map((p: any) => ({
        ...p,
        dimension: null,
        image_url: null,
      }));
    }

    const formatted = (products || []).map((p: any) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      const wt = cat?.wire_type ? (Array.isArray(cat.wire_type) ? cat.wire_type[0] : cat.wire_type) : null;

      return {
        id: p.id,
        name: p.name,
        dimension: p.dimension || null,
        description: p.description || null,
        image_url: p.image_url || null,
        quantity: p.quantity ?? 1000,
        price: Number(p.price),
        discount: Number(p.discount || 0),
        category_id: p.category_id,
        category: cat ? { ...cat, wire_type: wt } : null,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });

    return sendSuccess({ products: formatted }, 200);
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

    const insertPayload: Record<string, any> = {
      name: productData.name.trim(),
      dimension: productData.dimension?.trim() || null,
      description: productData.description?.trim() || null,
      image_url: productData.image_url?.trim() || null,
      price: productData.price,
      quantity: 1000, // Products are always available, background safe default
      discount: 0.00, // No discount, background safe default
      category_id: productData.category_id,
    };

    const insertRes = await supabase!
      .from("products")
      .insert(insertPayload)
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

    let newProduct: any = insertRes.data;
    let insertError = insertRes.error;

    // Fallback if dimension or image_url columns don't exist yet
    if (insertError && (insertError.code === "42703" || insertError.message?.includes("does not exist"))) {
      delete insertPayload.dimension;
      delete insertPayload.image_url;

      const fallback = await supabase!
        .from("products")
        .insert(insertPayload)
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

      newProduct = fallback.data;
      insertError = fallback.error;
    }

    if (insertError) {
      return sendServerError(insertError, "Failed to create product in database.");
    }

    return sendSuccess({ product: newProduct }, 201);
  } catch (err) {
    return sendServerError(err, "Unexpected error creating product.");
  }
}
