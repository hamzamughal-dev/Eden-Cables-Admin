"use client";

import React, { useState } from "react";
import { ProductRecord } from "@/types/admin";
import { AlertTriangle, Loader2, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  product: ProductRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

import { useDeleteProductMutation } from "@/hooks/useProducts";

export function DeleteConfirmationModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useDeleteProductMutation({
    onSuccess: (deletedId) => {
      onSuccess(deletedId);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  if (!isOpen || !product) return null;

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate(product.id);
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
            <h3 className="text-base font-semibold text-slate-900">Delete Product</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This action requires administrator confirmation.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm mb-4">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Product To Remove:
          </span>
          <p className="font-semibold text-slate-900 mt-0.5 text-base truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span>Price: ${Number(product.price).toFixed(2)}</span>
            <span>Stock: {product.quantity} units</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong>Integrity Guard Active:</strong> If any customer product inquiries reference this product, deletion will be blocked by the server to preserve historical records.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
            <p className="font-semibold mb-1">Deletion Blocked</p>
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
