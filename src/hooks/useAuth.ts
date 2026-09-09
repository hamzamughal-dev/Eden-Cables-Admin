"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLoginAction, AdminAuthResponse } from "@/lib/auth/admin";
import { LoginInput } from "@/validations/auth";

export interface UseAdminLoginMutationOptions {
  onSuccess?: (data: AdminAuthResponse) => void;
  onError?: (error: Error) => void;
}

export function useAdminLoginMutation(options?: UseAdminLoginMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginInput): Promise<AdminAuthResponse> => {
      const response = await adminLoginAction(data);
      if (!response.success) {
        throw new Error(response.error || "Authentication failed.");
      }
      return response;
    },
    onSuccess: (data) => {
      queryClient.clear();
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
