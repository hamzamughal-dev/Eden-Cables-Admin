import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import {
  sendSuccess,
  sendServerError,
  sendValidationError,
} from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return sendValidationError({ file: ["No file was uploaded."] });
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validMimes.includes(file.type)) {
      return sendValidationError({
        file: ["Invalid file type. Supported: JPG, PNG, WebP, SVG."],
      });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return sendValidationError({
        file: ["Image file size cannot exceed 5MB."],
      });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Attempt upload to Supabase storage bucket 'product-images'
    const { data, error: uploadError } = await supabase!.storage
      .from("product-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // If bucket doesn't exist or permissions error, convert to base64 Data URL fallback
      console.warn("[STORAGE_UPLOAD_WARNING]:", uploadError.message);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return sendSuccess({ url: base64, filename }, 200);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase!.storage.from("product-images").getPublicUrl(data.path);

    return sendSuccess({ url: publicUrl, filename }, 200);
  } catch (err) {
    return sendServerError(err, "Unexpected error uploading image.");
  }
}
