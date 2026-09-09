import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
  sendNotFound,
  sendBadRequest,
} from "@/lib/api/response";
import { updateRequestStatusSchema } from "@/validations/request";

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
      return sendBadRequest("Invalid request identifier format. Must be a valid UUID.");
    }

    const { data: request, error } = await supabase!
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
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return sendServerError(error, "Failed to retrieve product request.");
    }

    if (!request) {
      return sendNotFound(`Product request with ID '${id}' was not found.`);
    }

    return sendSuccess({ request }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error retrieving product request.");
  }
}

export async function PATCH(
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
      return sendBadRequest("Invalid request identifier format. Must be a valid UUID.");
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return sendValidationError(null, "Invalid JSON payload.");
    }

    const validation = updateRequestStatusSchema.safeParse(rawBody);
    if (!validation.success) {
      return sendValidationError(
        validation.error.flatten().fieldErrors,
        "Invalid request status. Must be pending, contacted, completed, or cancelled."
      );
    }

    const { status } = validation.data;

    const { data: existingRequest, error: findError } = await supabase!
      .from("product_requests")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to verify request existence.");
    }

    if (!existingRequest) {
      return sendNotFound(`Product request with ID '${id}' was not found.`);
    }

    const { data: updatedRequest, error: updateError } = await supabase!
      .from("product_requests")
      .update({ status })
      .eq("id", id)
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
      .single();

    if (updateError) {
      return sendServerError(updateError, "Failed to update product request status.");
    }

    return sendSuccess({ request: updatedRequest }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error updating product request status.");
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
      return sendBadRequest("Invalid request identifier format. Must be a valid UUID.");
    }

    const { data: request, error: findError } = await supabase!
      .from("product_requests")
      .select("id, full_name")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return sendServerError(findError, "Failed to check request existence.");
    }

    if (!request) {
      return sendNotFound(`Product request with ID '${id}' was not found.`);
    }

    const { error: deleteError } = await supabase!
      .from("product_requests")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return sendServerError(deleteError, "Failed to delete product request.");
    }

    return sendSuccess(
      {
        id,
        deleted: true,
        message: `Product request from "${request.full_name}" was successfully deleted.`,
      },
      200
    );
  } catch (err) {
    return sendServerError(err, "Unexpected error deleting product request.");
  }
}
