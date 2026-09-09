import { requireAdmin } from "@/lib/api/auth";
import { fetchRegisteredUsers } from "@/lib/services/user-service";
import { sendSuccess, sendServerError } from "@/lib/api/response";

export async function GET() {
  try {
    const { supabase, errorResponse } = await requireAdmin();
    if (errorResponse) {
      return errorResponse;
    }

    const users = await fetchRegisteredUsers(supabase!);

    return sendSuccess(
      {
        users,
        total: users.length,
      },
      200
    );
  } catch (err) {
    return sendServerError(err, "Failed to retrieve registered users.");
  }
}
