"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductRequestRecord, ProductRequestStatus } from "@/types/admin";

export const REQUESTS_QUERY_KEY = ["admin", "requests"] as const;

export interface UseRequestMutationOptions<TData = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export function useUpdateRequestStatusMutation(
  options?: UseRequestMutationOptions<{ id: string; status: ProductRequestStatus }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: ProductRequestStatus;
    }): Promise<{ id: string; status: ProductRequestStatus }> => {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update request status.");
      }

      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

/**
 * Dedicated React Query mutation for deleting a product request.
 */
export function useDeleteRequestMutation(options?: UseRequestMutationOptions<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete product request.");
      }

      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
      options?.onSuccess?.(deletedId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
