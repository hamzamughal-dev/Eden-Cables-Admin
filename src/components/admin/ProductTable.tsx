"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductRecord, CategoryRecord, WireTypeRecord } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  Image as ImageIcon,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface ProductWithCategory extends ProductRecord {
  category?: CategoryRecord | null;
}

interface ProductTableProps {
  initialProducts: ProductWithCategory[];
  categories?: CategoryRecord[];
  wireTypes?: WireTypeRecord[];
}

export function ProductTable({
  initialProducts,
  categories = [],
  wireTypes = [],
}: ProductTableProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWireType, setSelectedWireType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCategory | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Available categories based on selected metal
  const availableCategories = categories.filter((c) => {
    if (selectedWireType === "all") return true;
    return c.wire_type_id === selectedWireType;
  });

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      p.name.toLowerCase().includes(query) ||
      (p.dimension && p.dimension.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query));

    // Match metal type
    let matchesMetal = true;
    if (selectedWireType !== "all") {
      const cat = categories.find((c) => c.id === p.category_id);
      matchesMetal = cat?.wire_type_id === selectedWireType;
    }

    // Match category
    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;

    return matchesSearch && matchesMetal && matchesCategory;
  });

  const handleDeleteSuccess = (deletedId: string) => {
    const deletedItem = products.find((p) => p.id === deletedId);
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
    setSuccessToast(`Product "${deletedItem?.name || "Item"}" was successfully removed.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in">
          <span>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white cursor-pointer ml-4 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
        {/* Metal Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[#e01b22]" /> Metal:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedWireType("all");
              setSelectedCategory("all");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedWireType === "all"
                ? "bg-[#e01b22] text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Conductors ({products.length})
          </button>

          {wireTypes.map((wt) => {
            const isSelected = selectedWireType === wt.id;
            const count = products.filter((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return cat?.wire_type_id === wt.id;
            }).length;

            return (
              <button
                key={wt.id}
                type="button"
                onClick={() => {
                  setSelectedWireType(wt.id);
                  setSelectedCategory("all");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#e01b22] text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{wt.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Category Filter, and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by dimension (e.g. 3/29, 7/29) or cable title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e01b22] focus:ring-1 focus:ring-[#e01b22]"
              />
            </div>

            {availableCategories.length > 0 && (
              <div className="w-full sm:w-56">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#e01b22] cursor-pointer"
                >
                  <option value="all">All Core Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Link href="/products/new">
            <Button
              variant="emerald"
              size="sm"
              className="cursor-pointer gap-2 shrink-0 font-semibold shadow-sm w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Specification</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 px-4 font-semibold w-16 text-center">
                  Image
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Dimension &amp; Title
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Metal / Core
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-right">
                  Unit Rate
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-center">
                  Availability
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Created Date
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-base font-semibold text-slate-700">
                      No wire specifications found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery || selectedCategory !== "all" || selectedWireType !== "all"
                        ? "Try adjusting your search query, metal tab, or category filter."
                        : "Start by adding your first wire dimension."}
                    </p>
                    {!searchQuery && selectedCategory === "all" && (
                      <div className="mt-4">
                        <Link href="/products/new">
                          <Button variant="emerald" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Specification
                          </Button>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const numPrice = Number(product.price);
                  const cat = categories.find((c) => c.id === product.category_id) || product.category;
                  const wt = cat?.wire_type_id
                    ? wireTypes.find((w) => w.id === cat.wire_type_id)
                    : (cat as any)?.wire_type;
                  const metalName = wt?.name || (cat?.name?.includes("Copper") ? "Copper" : cat?.name?.includes("Aluminum") ? "Aluminum" : "Conductor");

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Thumbnail Image */}
                      <td className="py-3 px-4 text-center">
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 mx-auto">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Dimension & Title */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-baseline gap-2">
                          {product.dimension && (
                            <span className="font-mono text-xs font-extrabold text-[#e01b22] bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0">
                              {product.dimension}
                            </span>
                          )}
                          <span className="font-semibold text-slate-900 group-hover:text-[#e01b22] transition-colors">
                            {product.name}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </td>

                      {/* Metal & Core Category */}
                      <td className="py-4 px-4 whitespace-nowrap space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                              metalName.toLowerCase().includes("copper")
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            <Zap className="h-3 w-3" />
                            {metalName}
                          </span>
                          <Badge variant="cyan" className="font-medium text-xs">
                            {cat?.name || "General"}
                          </Badge>
                        </div>
                      </td>

                      {/* Price (Clean Unit Rate, No Discounts) */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-sm font-bold text-slate-900">
                          {formatCurrency(numPrice)}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">per meter</span>
                      </td>

                      {/* Availability (Always In Stock) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Always Available
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(product.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300 cursor-pointer"
                              title="Edit specification"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingProduct(product)}
                            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-300 cursor-pointer"
                            title="Delete specification"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Metrics */}
        <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of{" "}
            <strong className="text-slate-900">{products.length}</strong> wire specifications
          </span>
          <span className="hidden sm:inline">
            Manufactured to PSQCA &amp; IEC Standards
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        product={deletingProduct}
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
