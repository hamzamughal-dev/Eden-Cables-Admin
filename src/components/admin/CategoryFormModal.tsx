"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryInput } from "@/validations/category";
import { CategoryRecord } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { X, Loader2, Layers } from "lucide-react";

interface CategoryWithProductCount extends CategoryRecord {
  product_count?: number;
}

interface CategoryFormModalProps {
  category: CategoryWithProductCount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedCategory: CategoryWithProductCount) => void;
}

interface CategoryFormContentProps {
  category: CategoryWithProductCount | null;
  onClose: () => void;
  onSuccess: (savedCategory: CategoryWithProductCount) => void;
}

import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/hooks/useCategories";

function CategoryFormContent({
  category,
  onClose,
  onSuccess,
}: CategoryFormContentProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = Boolean(category?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const createCategoryMutation = useCreateCategoryMutation({
    onSuccess: (saved) => {
      onSuccess({
        ...saved,
        product_count: 0,
      });
      onClose();
    },
    onError: (err) => {
      setServerError(err.message);
    },
  });

  const updateCategoryMutation = useUpdateCategoryMutation(category?.id || "", {
    onSuccess: (saved) => {
      onSuccess({
        ...saved,
        product_count: category?.product_count || 0,
      });
      onClose();
    },
    onError: (err) => {
      setServerError(err.message);
    },
  });

  const onSubmit = (data: CategoryInput) => {
    setServerError(null);
    if (isEdit) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900">
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isEdit ? "Edit Category" : "Create New Category"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEdit
              ? "Update category naming and specifications"
              : "Add a new product classification to the catalog"}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
          <p className="font-semibold mb-0.5">Could not save category</p>
          <p className="leading-relaxed">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="category_name"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Category Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="category_name"
            type="text"
            {...register("name")}
            placeholder="e.g. Industrial Ethernet Cables"
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
              errors.name
                ? "border-rose-500 focus:border-rose-500"
                : "border-slate-300 hover:border-slate-400"
            }`}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-500">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="category_description"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Description (Optional)
          </label>
          <textarea
            id="category_description"
            rows={3}
            {...register("description")}
            placeholder="Brief description of cable types and typical industry applications..."
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] resize-y ${
              errors.description
                ? "border-rose-500 focus:border-rose-500"
                : "border-slate-300 hover:border-slate-400"
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-rose-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="emerald"
            size="sm"
            disabled={isSubmitting}
            className="cursor-pointer font-semibold shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function CategoryFormModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <CategoryFormContent
        key={category?.id || "new"}
        category={category}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
