"use client";

import React, { useState } from "react";
import { ProductRequestRecord } from "@/types/admin";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExtendedProductRequest extends ProductRequestRecord {
  product?: {
    id?: string;
    name: string;
    price: number;
    discount: number;
    quantity?: number;
    category?: {
      id?: string;
      name: string;
    };
  };
}

interface DeleteRequestModalProps {
  request: ExtendedProductRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

import { useDeleteRequestMutation } from "@/hooks/useRequests";

export function DeleteRequestModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: DeleteRequestModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useDeleteRequestMutation({
    onSuccess: (deletedId) => {
      onSuccess(deletedId);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  if (!isOpen || !request) return null;

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate(request.id);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="h-10 w-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Delete Inquiry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm deletion of this customer product request.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Customer:</span>
            <strong className="text-slate-900 font-medium">{request.full_name}</strong>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Product:</span>
            <span className="text-slate-800 truncate max-w-[200px]">
              {request.product?.name || "Referenced Product"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Phone:</span>
            <span className="text-slate-800 font-mono">{request.phone}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
            <p className="font-semibold mb-1">Delete Failed</p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
