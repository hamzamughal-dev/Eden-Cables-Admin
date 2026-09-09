import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsLoading() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-slate-200 bg-white/95 px-6 py-4 flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-8 w-24 rounded-[6px]" />
      </div>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-10 w-72 max-w-full rounded-[6px]" />
            <Skeleton className="h-10 w-44 rounded-[6px]" />
          </div>
          <Skeleton className="h-10 w-36 rounded-[6px]" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-6 py-3.5 grid grid-cols-12 gap-4 border-b border-slate-200">
            <div className="col-span-4">
              <Skeleton className="h-3.5 w-32" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="col-span-2 flex justify-end">
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 space-y-1.5">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-6 w-20 rounded-[4px]" />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-[6px]" />
                  <Skeleton className="h-8 w-8 rounded-[6px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
