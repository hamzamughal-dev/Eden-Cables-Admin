"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/validations/product";
import { CategoryRecord, ProductRecord } from "@/types/admin";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2, Tag, Percent, Layers, DollarSign } from "lucide-react";
import Link from "next/link";

import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/useProducts";

interface ProductFormProps {
  initialProduct?: ProductRecord;
  categories?: CategoryRecord[];
  mode?: "create" | "edit";
}

export function ProductForm({
  initialProduct,
  categories,
  mode = "create",
}: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = mode === "edit" && Boolean(initialProduct?.id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialProduct?.name || "",
      description: initialProduct?.description || "",
      quantity: initialProduct ? Number(initialProduct.quantity) : 0,
      price: initialProduct ? Number(initialProduct.price) : 0,
      discount: initialProduct ? Number(initialProduct.discount) : 0,
      category_id: initialProduct?.category_id || "",
    },
  });

  const watchedPrice = watch("price") || 0;
  const watchedDiscount = watch("discount") || 0;

  const numPrice = Number(watchedPrice) || 0;
  const numDiscount = Number(watchedDiscount) || 0;
  const effectivePrice = Math.max(0, numPrice * (1 - numDiscount / 100));

  const createProductMutation = useCreateProductMutation({
    onSuccess: () => {
      router.push("/products");
      router.refresh();
    },
    onError: (err) => {
      setServerError(err.message);
    },
  });

  const updateProductMutation = useUpdateProductMutation(initialProduct?.id || "", {
    onSuccess: () => {
      router.push("/products");
      router.refresh();
    },
    onError: (err) => {
      setServerError(err.message);
    },
  });

  const onSubmit = (data: ProductInput) => {
    setServerError(null);
    if (isEdit) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Link>
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
              "Create Product"
            )}
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm">
          <p className="font-semibold mb-0.5">Could not save product</p>
          <p>{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#e01b22]" />
              General Information
            </h2>

            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Product Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                placeholder="e.g. Cat6A Shielded Industrial Ethernet Cable (305m)"
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
                  errors.name
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
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
                htmlFor="description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                placeholder="Detailed technical specifications, construction details, and compliance standards..."
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] resize-y ${
                  errors.description
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-rose-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Card: Pricing & Discount */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#e01b22]" />
              Pricing & Discounts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Base Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Base Price ($ USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-white pl-8 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
                      errors.price
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.price.message}</p>
                )}
              </div>

              {/* Discount Percentage */}
              <div>
                <label
                  htmlFor="discount"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Discount Percentage (%)
                </label>
                <div className="relative">
                  <input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register("discount", { valueAsNumber: true })}
                    placeholder="0"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-white pr-8 pl-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
                      errors.discount
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-sm font-semibold">
                    <Percent className="h-3.5 w-3.5" />
                  </span>
                </div>
                {errors.discount && (
                  <p className="mt-1.5 text-xs text-rose-500">
                    {errors.discount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Live Pricing Summary Box */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Effective Customer Price:</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  ${effectivePrice.toFixed(2)}
                </p>
              </div>
              {numDiscount > 0 && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Save ${(numPrice * (numDiscount / 100)).toFixed(2)} ({numDiscount}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#e01b22]" />
              Category
            </h2>

            <div>
              <label
                htmlFor="category_id"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Category <span className="text-rose-500">*</span>
              </label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <CategorySelect
                    id="category_id"
                    value={field.value}
                    onChange={field.onChange}
                    categories={categories}
                    error={errors.category_id?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#e01b22]" />
              Inventory & Stock
            </h2>

            <div>
              <label
                htmlFor="quantity"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Stock Quantity (Units) <span className="text-rose-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="1"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="0"
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
                  errors.quantity
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              />
              {errors.quantity && (
                <p className="mt-1.5 text-xs text-rose-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
