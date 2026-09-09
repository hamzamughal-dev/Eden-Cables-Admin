import { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendUnauthorized, sendForbidden } from "./response";
import { NextResponse } from "next/server";
import { SafeAdminUser } from "@/types/admin";

export interface RequireAdminSuccess {
  user: User;
  profile: SafeAdminUser;
  supabase: SupabaseClient;
  errorResponse: null;
}

export interface RequireAdminError {
  user: null;
  profile: null;
  supabase: SupabaseClient | null;
  errorResponse: NextResponse;
}

export type RequireAdminResult = RequireAdminSuccess | RequireAdminError;

export async function requireAdmin(
  client?: SupabaseClient
): Promise<RequireAdminResult> {
  const supabase = client || (await createClient());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      supabase,
      errorResponse: sendUnauthorized(
        "Authentication required. Please sign in as an administrator."
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, role, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    try {
      await supabase.auth.signOut();
    } catch {}

    return {
      user: null,
      profile: null,
      supabase,
      errorResponse: sendForbidden(
        "Access Denied: Administrator privileges required to access this resource."
      ),
    };
  }

  return {
    user,
    profile: profile as SafeAdminUser,
    supabase,
    errorResponse: null,
  };
}

export const authorizeAdminApi = requireAdmin;
