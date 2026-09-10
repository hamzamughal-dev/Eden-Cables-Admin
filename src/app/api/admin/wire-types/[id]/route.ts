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
import { wireTypeSchema } from "@/validations/wireType";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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
        "Validation failed for wire type update."
      );
    }

    const { name, description } = validation.data;
    const trimmedName = name.trim();

    const { data: updatedWireType, error: updateError } = await supabase!
      .from("wire_types")
      .update({
        name: trimmedName,
        description: description?.trim() || null,
      })
      .eq("id", id)
      .select("id, name, description, created_at, updated_at")
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        return sendConflict(`A wire type with the name "${trimmedName}" already exists.`);
      }
      return sendServerError(updateError, "Failed to update wire type.");
    }

    return sendSuccess({ wireType: updatedWireType }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error updating wire type.");
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

    const { data: wireType, error: findError } = await supabase!
      .from("wire_types")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to verify wire type existence.");
    }

    if (!wireType) {
      return sendNotFound(`Wire type with ID '${id}' was not found.`);
    }

    const { count: catCount } = await supabase!
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("wire_type_id", id);

    if (catCount && catCount > 0) {
      return sendConflict(
        `Cannot delete wire type "${wireType.name}" because it contains ${catCount} categories.`
      );
    }

    const { error: deleteError } = await supabase!
      .from("wire_types")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return sendServerError(deleteError, "Failed to delete wire type.");
    }

    return sendSuccess(
      { id, deleted: true, message: `Wire type "${wireType.name}" was deleted.` },
      200
    );
  } catch (err) {
    return sendServerError(err, "Unexpected error deleting wire type.");
  }
}
