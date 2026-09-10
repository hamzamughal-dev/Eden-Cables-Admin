import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
  sendConflict,
} from "@/lib/api/response";
import { wireTypeSchema } from "@/validations/wireType";

// Fallback seed metals if table has not been migrated yet
const FALLBACK_WIRE_TYPES = [
  {
    id: "copper-wire-type-default",
    name: "Copper",
    description: "99.99% pure electrolytic grade copper conductors with superior conductivity.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_count: 0,
    product_count: 0,
  },
  {
    id: "aluminum-wire-type-default",
    name: "Aluminum",
    description: "High-conductivity EC grade aluminum conductors for cost-effective, lightweight distribution.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category_count: 0,
    product_count: 0,
  },
];

export async function GET() {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const { data: wireTypes, error } = await supabase!
      .from("wire_types")
      .select(
        `
        id,
        name,
        description,
        created_at,
        updated_at,
        categories (
          id
        )
      `
      )
      .order("name", { ascending: true });

    if (error) {
      // If table doesn't exist yet in Supabase, return fallback list gracefully
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return sendSuccess({ wireTypes: FALLBACK_WIRE_TYPES }, 200);
      }
      return sendServerError(error, "Failed to retrieve wire types.");
    }

    const formatted = (wireTypes || []).map((wt: any) => ({
      id: wt.id,
      name: wt.name,
      description: wt.description,
      created_at: wt.created_at,
      updated_at: wt.updated_at,
      category_count: Array.isArray(wt.categories) ? wt.categories.length : 0,
    }));

    return sendSuccess({ wireTypes: formatted }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving wire types.");
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

    const validation = wireTypeSchema.safeParse(rawBody);
    if (!validation.success) {
      return sendValidationError(
        validation.error.flatten().fieldErrors,
        "Validation failed for wire metal/type creation."
      );
    }

    const { name, description } = validation.data;
    const trimmedName = name.trim();

    const { data: existing, error: checkError } = await supabase!
      .from("wire_types")
      .select("id, name")
      .ilike("name", trimmedName)
      .maybeSingle();

    if (checkError && checkError.code !== "42P01") {
      return sendServerError(checkError, "Failed to check name uniqueness.");
    }

    if (existing) {
      return sendConflict(
        `A wire type/metal with the name "${existing.name}" already exists.`
      );
    }

    const { data: newWireType, error: insertError } = await supabase!
      .from("wire_types")
      .insert({
        name: trimmedName,
        description: description?.trim() || null,
      })
      .select("id, name, description, created_at, updated_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return sendConflict(`A wire type with the name "${trimmedName}" already exists.`);
      }
      return sendServerError(insertError, "Failed to create wire type.");
    }

    return sendSuccess({ wireType: newWireType }, 201);
  } catch (err) {
    return sendServerError(err, "Unexpected error creating wire type.");
  }
}
