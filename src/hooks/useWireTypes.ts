"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WireTypeInput } from "@/validations/wireType";
import { WireTypeRecord } from "@/types/admin";

export const WIRE_TYPES_QUERY_KEY = ["admin", "wire-types"] as const;

export function useWireTypesQuery() {
  return useQuery({
    queryKey: WIRE_TYPES_QUERY_KEY,
    queryFn: async (): Promise<WireTypeRecord[]> => {
      const response = await fetch("/api/admin/wire-types");
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load wire types.");
      }
      return json.data.wireTypes as WireTypeRecord[];
    },
  });
}

export function useCreateWireTypeMutation(options?: {
  onSuccess?: (data: WireTypeRecord) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WireTypeInput): Promise<WireTypeRecord> => {
      const response = await fetch("/api/admin/wire-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to create wire type.");
      }
      return json.data.wireType as WireTypeRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WIRE_TYPES_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useUpdateWireTypeMutation(
  id: string,
  options?: {
    onSuccess?: (data: WireTypeRecord) => void;
    onError?: (error: Error) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WireTypeInput): Promise<WireTypeRecord> => {
      const response = await fetch(`/api/admin/wire-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update wire type.");
      }
      return json.data.wireType as WireTypeRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WIRE_TYPES_QUERY_KEY });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useDeleteWireTypeMutation(options?: {
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const response = await fetch(`/api/admin/wire-types/${id}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete wire type.");
      }
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: WIRE_TYPES_QUERY_KEY });
      options?.onSuccess?.(deletedId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
