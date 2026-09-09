"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductRecord, CategoryRecord } from "@/types/admin";
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
  AlertCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";

interface ProductWithCategory extends ProductRecord {
  category?: {
    id: string;
    name: string;
  };
}

interface ProductTableProps {
  initialProducts: ProductWithCategory[];
  categories?: CategoryRecord[];
}

export function ProductTable({
  initialProducts,
  categories = [],
}: ProductTableProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCategory | null>(
    null
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || p.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDeleteSuccess = (deletedId: string) => {
    const deletedItem = products.find((p) => p.id === deletedId);
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
    setSuccessToast(`Product "${deletedItem?.name || "Item"}" was successfully removed.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e01b22] focus:ring-1 focus:ring-[#e01b22]"
            />
          </div>

          {categories.length > 0 && (
            <div className="w-full sm:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#e01b22] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
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
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Product
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Category
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-right">
                  Stock
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-right">
                  Price
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-center">
                  Discount
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
                      No products found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search query or category filter."
                        : "Start by creating your first product."}
                    </p>
                    {!searchQuery && selectedCategory === "all" && (
                      <div className="mt-4">
                        <Link href="/products/new">
                          <Button variant="emerald" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Product
                          </Button>
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const numPrice = Number(product.price);
                  const numDiscount = Number(product.discount);
                  const hasDiscount = numDiscount > 0;
                  const effectivePrice = hasDiscount
                    ? numPrice * (1 - numDiscount / 100)
                    : numPrice;

                  const isOutOfStock = product.quantity === 0;
                  const isLowStock = product.quantity > 0 && product.quantity < 10;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 group-hover:text-[#e01b22] transition-colors">
                          {product.name}
                        </div>
                        {product.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge variant="cyan" className="font-normal text-xs">
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold text-slate-900">
                          {product.quantity}
                        </div>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-semibold text-rose-500">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-semibold text-amber-600">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold text-slate-900">
                          {formatCurrency(effectivePrice)}
                        </div>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(numPrice)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {hasDiscount ? (
                          <Badge variant="warning" className="text-xs font-semibold">
                            {numDiscount}% OFF
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(product.created_at)}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300 cursor-pointer"
                              title="Edit product"
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
                            title="Delete product"
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
            <strong className="text-slate-900">{products.length}</strong> products
          </span>
          <span className="hidden sm:inline">
            Active Catalog Database
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
