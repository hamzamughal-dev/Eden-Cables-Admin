import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";

export function sendSuccess<T>(data: T, status: number = 200, meta?: Record<string, unknown>) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return NextResponse.json(response, { status });
}

export function sendError(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
) {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(response, { status });
}

export function sendBadRequest(message: string = "Bad request.", details?: unknown) {
  return sendError("BAD_REQUEST", message, 400, details);
}

export function sendUnauthorized(message: string = "Authentication required.") {
  return sendError("UNAUTHORIZED", message, 401);
}

export function sendForbidden(message: string = "Access denied. Insufficient privileges.") {
  return sendError("FORBIDDEN", message, 403);
}

export function sendNotFound(message: string = "Resource not found.") {
  return sendError("NOT_FOUND", message, 404);
}

export function sendConflict(message: string = "Conflict occurred with current resource state.", details?: unknown) {
  return sendError("CONFLICT", message, 409, details);
}

export function sendValidationError(details: unknown, message: string = "Validation failed.") {
  return sendError("VALIDATION_ERROR", message, 422, details);
}

export function sendServerError(
  error: unknown,
  message: string = "An unexpected server error occurred."
) {
  const isDev = process.env.NODE_ENV === "development";
  return sendError(
    "INTERNAL_SERVER_ERROR",
    message,
    500,
    isDev && error instanceof Error ? { stack: error.stack } : undefined
  );
}
