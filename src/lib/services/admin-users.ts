import { SafeAdminUser } from "@/types";

export interface GetAdminUsersResult {
  users: SafeAdminUser[];
  total: number;
  error?: string;
}

export async function getAdminUsers(): Promise<GetAdminUsersResult> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        body.error?.message ||
        body.error ||
        `Failed to fetch users (HTTP ${res.status})`;
      return {
        users: [],
        total: 0,
        error: errorMessage,
      };
    }

    const payload = body.data || body;
    return {
      users: payload.users || [],
      total: payload.total ?? payload.users?.length ?? 0,
    };
  } catch {
    return {
      users: [],
      total: 0,
      error: "Network error: Unable to reach the administrative user service.",
    };
  }
}
