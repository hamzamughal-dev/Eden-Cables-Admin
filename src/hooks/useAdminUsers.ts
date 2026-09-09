"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/lib/services/admin-users";
import { SafeAdminUser } from "@/types";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

export interface UseAdminUsersReturn {
  users: SafeAdminUser[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
  isFetching: boolean;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: getAdminUsers,
  });

  const users = data?.users || [];
  const total = data?.total ?? users.length;
  const errorMessage = isError
    ? (error as Error)?.message || "Failed to load registered users."
    : data?.error || null;

  return {
    users,
    total,
    isLoading,
    isError: isError || Boolean(data?.error),
    errorMessage,
    refetch,
    isFetching,
  };
}
