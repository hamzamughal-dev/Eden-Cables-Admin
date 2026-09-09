"use client";

import React, { useState } from "react";
import { CategoryRecord } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { DeleteCategoryModal } from "@/components/admin/DeleteCategoryModal";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Package,
} from "lucide-react";

interface CategoryWithProductCount extends CategoryRecord {
  product_count?: number;
}

interface CategoryTableProps {
  initialCategories: CategoryWithProductCount[];
}

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const [categories, setCategories] =
    useState<CategoryWithProductCount[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithProductCount | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithProductCount | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  const handleSavedCategory = (saved: CategoryWithProductCount) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [saved, ...prev];
    });

    setToastMessage(
      editingCategory
        ? `Category "${saved.name}" was updated.`
        : `Category "${saved.name}" was created successfully.`
    );
    setTimeout(() => setToastMessage(null), 4000);
    setEditingCategory(null);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    const deleted = categories.find((c) => c.id === deletedId);
    setCategories((prev) => prev.filter((c) => c.id !== deletedId));
    setToastMessage(
      `Category "${deleted?.name || "Item"}" was successfully removed.`
    );
    setTimeout(() => setToastMessage(null), 4000);
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
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white cursor-pointer ml-4 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e01b22] focus:ring-1 focus:ring-[#e01b22]"
          />
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setIsCreateOpen(true);
          }}
          className="cursor-pointer gap-2 shrink-0 font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Category Name
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Description
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-center">
                  Assigned Products
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Layers className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-base font-semibold text-slate-700">
                      No categories found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery
                        ? "Try adjusting your search query."
                        : "Create your first product category to organize your catalog."}
                    </p>
                    {!searchQuery && (
                      <div className="mt-4">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(null);
                            setIsCreateOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Category
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const productCount = cat.product_count || 0;
                  const hasProducts = productCount > 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 group-hover:text-[#e01b22] transition-colors flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#e01b22] shrink-0" />
                          <span>{cat.name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {cat.description || (
                            <span className="italic text-slate-400">
                              No description provided
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <Badge
                          variant={hasProducts ? "cyan" : "secondary"}
                          className="text-xs font-semibold gap-1.5"
                        >
                          <Package className="h-3 w-3" />
                          <span>
                            {productCount} product{productCount === 1 ? "" : "s"}
                          </span>
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(cat.created_at)}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(cat)}
                            className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300 cursor-pointer"
                            title="Edit category"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingCategory(cat)}
                            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-300 cursor-pointer"
                            title={
                              hasProducts
                                ? "View deletion constraints (contains active products)"
                                : "Delete category"
                            }
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

        <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Total Categories:{" "}
            <strong className="text-slate-900">{categories.length}</strong>
          </span>
          <span className="hidden sm:inline">
            Used across public storefront and admin catalog
          </span>
        </div>
      </div>

      <CategoryFormModal
        category={editingCategory}
        isOpen={isCreateOpen || Boolean(editingCategory)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={handleSavedCategory}
      />

      <DeleteCategoryModal
        category={deletingCategory}
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
