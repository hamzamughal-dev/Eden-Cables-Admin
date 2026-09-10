"use client";

import React, { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/validations/product";
import { CategoryRecord, ProductRecord, WireTypeRecord } from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Layers,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Check,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/useProducts";

interface ProductFormProps {
  initialProduct?: ProductRecord;
  categories?: CategoryRecord[];
  wireTypes?: WireTypeRecord[];
  mode?: "create" | "edit";
}

// Common industrial wire gauge & core dimensions in Pakistan / international standards
const POPULAR_DIMENSIONS = [
  "3/29",
  "7/29",
  "7/36",
  "7/44",
  "7/52",
  "7/64",
  "19/52",
  "19/64",
  "1.5 mm²",
  "2.5 mm²",
  "4.0 mm²",
  "6.0 mm²",
  "10 mm²",
  "16 mm²",
  "25 mm²",
  "35 mm²",
  "50 mm²",
  "70 mm²",
  "95 mm²",
  "120 mm²",
];

export function ProductForm({
  initialProduct,
  categories = [],
  wireTypes = [],
  mode = "create",
}: ProductFormProps) {
  const router = useRouter();
  const fileInputId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isEdit = mode === "edit" && Boolean(initialProduct?.id);

  // Find initial metal / wire type from initialProduct's category if available
  const initialCategory = categories.find((c) => c.id === initialProduct?.category_id);
  const initialWireTypeId =
    initialCategory?.wire_type_id ||
    (wireTypes.length > 0 ? wireTypes[0].id : "");

  const [selectedWireTypeId, setSelectedWireTypeId] = useState<string>(initialWireTypeId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialProduct?.name || "",
      dimension: initialProduct?.dimension || "",
      description: initialProduct?.description || "",
      price: initialProduct ? Number(initialProduct.price) : 0,
      image_url: initialProduct?.image_url || "",
      category_id: initialProduct?.category_id || "",
      quantity: 1000, // Always available
      discount: 0,
    },
  });

  const watchedDimension = watch("dimension");
  const watchedCategoryId = watch("category_id");
  const watchedImageUrl = watch("image_url");

  // Filter categories by selected wire metal
  const filteredCategories = categories.filter((cat) => {
    if (!selectedWireTypeId) return true;
    if (!cat.wire_type_id) return true; // Show unassigned categories in all
    return cat.wire_type_id === selectedWireTypeId;
  });

  // Auto-generate a descriptive product title when metal, category, or dimension changes
  const handleDimensionSelect = (dim: string) => {
    setValue("dimension", dim, { shouldValidate: true });

    // If title hasn't been heavily customized or is empty, auto-generate
    const currentMetal = wireTypes.find((wt) => wt.id === selectedWireTypeId)?.name || "Wire";
    const currentCategory = categories.find((c) => c.id === watchedCategoryId)?.name || "";
    
    if (currentCategory) {
      setValue("name", `${currentMetal} ${currentCategory} ${dim}`, { shouldValidate: true });
    } else {
      setValue("name", `${currentMetal} Cable ${dim}`, { shouldValidate: true });
    }
  };

  const handleCategoryChange = (catId: string) => {
    setValue("category_id", catId, { shouldValidate: true });

    const currentMetal = wireTypes.find((wt) => wt.id === selectedWireTypeId)?.name || "Wire";
    const chosenCat = categories.find((c) => c.id === catId)?.name || "";
    const dim = watchedDimension ? ` ${watchedDimension}` : "";

    if (chosenCat) {
      setValue("name", `${currentMetal} ${chosenCat}${dim}`, { shouldValidate: true });
    }
  };

  const handleMetalChange = (wtId: string) => {
    setSelectedWireTypeId(wtId);
    // Find matching category under new metal if possible
    const available = categories.filter((c) => c.wire_type_id === wtId);
    if (available.length > 0) {
      const match = available[0];
      handleCategoryChange(match.id);
    }
  };

  // Image file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to upload image.");
      }

      setValue("image_url", json.data.url, { shouldValidate: true });
    } catch (err: any) {
      setUploadError(err.message || "Could not upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

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
    const payload = {
      ...data,
      quantity: 1000,
      discount: 0,
    };
    if (isEdit) {
      updateProductMutation.mutate(payload);
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Product List</span>
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
            disabled={isSubmitting || isUploadingImage}
            className="cursor-pointer font-semibold shadow-sm gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Specification"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Hierarchy, Dimension, Pricing, Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1 & 2: Wire Metal & Core Category */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#e01b22]" />
                1. Conductor Metal &amp; Core Category
              </h2>
              <span className="text-xs font-mono font-medium text-slate-400">Step 1 of 3</span>
            </div>

            {/* Metal Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Conductor Metal <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wireTypes.map((wt) => {
                  const isSelected = selectedWireTypeId === wt.id;
                  return (
                    <button
                      key={wt.id}
                      type="button"
                      onClick={() => handleMetalChange(wt.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "border-[#e01b22] bg-red-50/40 ring-2 ring-[#e01b22]/20 text-[#23262b]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold">{wt.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#e01b22]" />}
                      </div>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {wt.name.toLowerCase().includes("copper")
                          ? "99.99% Electrolytic Pure"
                          : "EC Grade Distribution"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Category Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Core Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-full p-4 text-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
                    No categories found for this wire metal. Create categories in the Categories manager.
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = watchedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#e01b22] bg-red-50 text-[#e01b22] shadow-xs font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#e01b22]" />}
                      </button>
                    );
                  })
                )}
              </div>
              {errors.category_id && (
                <p className="mt-1.5 text-xs text-rose-500">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {/* STEP 2: Dimension & Sizing */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#e01b22]" />
                2. Dimension &amp; Sizing (e.g. 3/29, 7/29, 7/36)
              </h2>
              <span className="text-xs font-mono font-medium text-slate-400">Step 2 of 3</span>
            </div>

            {/* Quick preset chips */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2">
                Quick Select Standard Dimension:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DIMENSIONS.map((dim) => {
                  const isMatch = watchedDimension === dim;
                  return (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => handleDimensionSelect(dim)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                        isMatch
                          ? "bg-[#e01b22] text-white font-bold shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {dim}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Dimension input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dimension"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Dimension / Gauge <span className="text-rose-500">*</span>
                </label>
                <input
                  id="dimension"
                  type="text"
                  {...register("dimension")}
                  placeholder="e.g. 3/29 or 7/29 or 7/36"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setValue("dimension", e.target.value, { shouldValidate: true });
                  }}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm font-mono font-semibold text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
                    errors.dimension
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                />
                {errors.dimension && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.dimension.message}</p>
                )}
              </div>

              {/* Product Title / Display Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Full Specification Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  placeholder="e.g. Copper Single Core 3/29 Cable"
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
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Engineering Description &amp; Technical Notes
              </label>
              <textarea
                id="description"
                rows={3}
                {...register("description")}
                placeholder="Insulation type (PVC/XLPE), voltage rating (450/750V), PSQCA compliance, temperature rating..."
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] resize-y hover:border-slate-400"
              />
            </div>
          </div>

          {/* STEP 3: Pricing (Clean Rate, No Discounts) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#e01b22]" />
                3. List Pricing (Ex-Factory Rate)
              </h2>
              <span className="text-xs font-mono font-medium text-slate-400">Step 3 of 3</span>
            </div>

            <div className="max-w-md">
              <label
                htmlFor="price"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Unit Rate (PKR / Meter) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-sm font-semibold font-mono">
                  Rs.
                </span>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border bg-white pl-12 pr-3.5 py-2.5 text-base font-mono font-bold text-slate-900 placeholder-slate-400 transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] ${
                    errors.price
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-1.5 text-xs text-rose-500">{errors.price.message}</p>
              )}
              <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                This rate is directly shown to clients on the storefront. No discount or stock limits applied.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Product Image & Live Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#e01b22]" />
              Product Image
            </h2>

            {/* Live Preview Container */}
            <div className="relative aspect-square w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-3 text-center">
              {watchedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watchedImageUrl}
                  alt="Product preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-slate-500 block font-medium">No image uploaded</span>
                  <span className="text-[10px] text-slate-400 block">Upload a cable photo or paste a URL</span>
                </div>
              )}

              {watchedImageUrl && (
                <button
                  type="button"
                  onClick={() => setValue("image_url", "", { shouldValidate: true })}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1 text-xs hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>

            {/* File Upload Trigger */}
            <div className="space-y-3">
              <input
                id={fileInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                disabled={isUploadingImage || isSubmitting}
                className="hidden"
              />
              <label
                htmlFor={fileInputId}
                className={`w-full py-2.5 px-4 rounded-lg border border-dashed border-slate-300 hover:border-[#e01b22] bg-slate-50/50 hover:bg-red-50/30 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isUploadingImage ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#e01b22]" />
                    <span>Uploading photo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-[#e01b22]" />
                    <span>Upload Image File</span>
                  </>
                )}
              </label>

              {uploadError && (
                <p className="text-xs text-rose-500">{uploadError}</p>
              )}

              {/* Or URL input */}
              <div className="pt-2">
                <label
                  htmlFor="image_url"
                  className="block text-[11px] font-semibold text-slate-600 uppercase mb-1"
                >
                  Or Paste Public Image URL:
                </label>
                <input
                  id="image_url"
                  type="text"
                  {...register("image_url")}
                  placeholder="https://example.com/cable.jpg"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22]"
                />
              </div>
            </div>
          </div>

          {/* Availability Info Badge */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 space-y-1.5 text-xs">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Always Available Guarantee</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Products are treated as continuously manufactured and in-stock. Stock tracking and quantities have been disabled.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
