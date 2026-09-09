"use client";

import React, { useEffect, useState } from "react";
import { CategoryRecord } from "@/types/admin";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  categories?: CategoryRecord[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export function CategorySelect({
  id = "category_id",
  name = "category_id",
  value,
  onChange,
  categories: initialCategories,
  error,
  disabled = false,
  required = false,
  className,
  placeholder = "Select a product category...",
}: CategorySelectProps) {
  const [fetchedCategories, setFetchedCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(
    !initialCategories || initialCategories.length === 0
  );

  const categories =
    initialCategories && initialCategories.length > 0
      ? initialCategories
      : fetchedCategories;

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      return;
    }

    let isMounted = true;
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data?.categories) {
            setFetchedCategories(json.data.categories);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled || loading}
          required={required}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-2xs transition-colors focus:border-[#e01b22] focus:outline-none focus:ring-1 focus:ring-[#e01b22] disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-300 hover:border-slate-400",
            className
          )}
        >
          <option value="" disabled className="text-slate-400 bg-white">
            {loading ? "Loading categories..." : placeholder}
          </option>
          {categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
              className="text-slate-900 bg-white"
            >
              {cat.name}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <svg
              className="h-4 w-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
