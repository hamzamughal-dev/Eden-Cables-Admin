"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryInput } from "@/validations/category";
import { CategoryRecord } from "@/types/admin";

export const CATEGORIES_QUERY_KEY = ["admin", "categories"] as const;

export interface UseCategoryMutationOptions<TData = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export function useCreateCategoryMutation(options?: UseCategoryMutationOptions<CategoryRecord>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryInput): Promise<CategoryRecord> => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        const errorMsg =
          json.error?.message ||
          (json.error?.details
            ? Object.values(json.error.details).flat().join(", ")
            : "Failed to create category.");
        throw new Error(errorMsg);
      }

      return json.data.category as CategoryRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useUpdateCategoryMutation(
  categoryId: string,
  options?: UseCategoryMutationOptions<CategoryRecord>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryInput): Promise<CategoryRecord> => {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        const errorMsg =
          json.error?.message ||
          (json.error?.details
            ? Object.values(json.error.details).flat().join(", ")
            : "Failed to update category.");
        throw new Error(errorMsg);
      }

      return json.data.category as CategoryRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Dedicated React Query mutation for deleting a category.
 */
export function useDeleteCategoryMutation(options?: UseCategoryMutationOptions<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<string> => {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete category.");
      }

      return categoryId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      options?.onSuccess?.(deletedId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
