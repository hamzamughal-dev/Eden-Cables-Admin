"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductInput } from "@/validations/product";
import { ProductRecord } from "@/types/admin";

export const PRODUCTS_QUERY_KEY = ["admin", "products"] as const;

export interface UseProductMutationOptions<TData = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

export function useCreateProductMutation(options?: UseProductMutationOptions<ProductRecord>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductInput): Promise<ProductRecord> => {
      const response = await fetch("/api/admin/products", {
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
            : "Failed to create product.");
        throw new Error(errorMsg);
      }

      return json.data.product as ProductRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useUpdateProductMutation(
  productId: string,
  options?: UseProductMutationOptions<ProductRecord>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductInput): Promise<ProductRecord> => {
      const response = await fetch(`/api/admin/products/${productId}`, {
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
            : "Failed to update product.");
        throw new Error(errorMsg);
      }

      return json.data.product as ProductRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Dedicated React Query mutation for deleting a product.
 */
export function useDeleteProductMutation(options?: UseProductMutationOptions<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string): Promise<string> => {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete product.");
      }

      return productId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      options?.onSuccess?.(deletedId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
