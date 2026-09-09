import { SupabaseClient } from "@supabase/supabase-js";
import { SafeAdminUser } from "@/types/admin";

export async function fetchRegisteredUsers(
  supabase: SupabaseClient
): Promise<SafeAdminUser[]> {
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Database error querying profiles: ${error.message}`);
  }

  return (users as SafeAdminUser[]) || [];
}
