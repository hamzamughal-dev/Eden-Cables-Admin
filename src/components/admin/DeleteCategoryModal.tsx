"use client";

import React, { useState } from "react";
import { CategoryRecord } from "@/types/admin";
import { AlertTriangle, Loader2, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryWithProductCount extends CategoryRecord {
  product_count?: number;
}

interface DeleteCategoryModalProps {
  category: CategoryWithProductCount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

import { useDeleteCategoryMutation } from "@/hooks/useCategories";

export function DeleteCategoryModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCategoryModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useDeleteCategoryMutation({
    onSuccess: (deletedId) => {
      onSuccess(deletedId);
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  if (!isOpen || !category) return null;

  const productCount = category.product_count || 0;
  const hasProducts = productCount > 0;

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate(category.id);
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
            <h3 className="text-base font-semibold text-slate-900">Delete Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm removal of this product classification.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm mb-4">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Category:
          </span>
          <p className="font-semibold text-slate-900 mt-0.5 text-base truncate">
            {category.name}
          </p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span>Associated Products:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                hasProducts
                  ? "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
              }`}
            >
              {productCount} product{productCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Relational Guard Warning */}
        {hasProducts ? (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold mb-0.5">Deletion Prevented by Server Guard</p>
              <p className="leading-relaxed">
                This category contains <strong>{productCount}</strong> product(s). Deleting it would create broken product records. You must reassign or remove these products before deleting this category.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs mb-4">
            No products currently belong to this category. It can be safely deleted without impacting the catalog.
          </div>
        )}

        {/* Server Conflict / Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
            <p className="font-semibold mb-1">Action Blocked</p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Modal Actions */}
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
            disabled={isDeleting || hasProducts}
            className="cursor-pointer font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            title={hasProducts ? "Cannot delete while products belong to this category" : "Delete category"}
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
