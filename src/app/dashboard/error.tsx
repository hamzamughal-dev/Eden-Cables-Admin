"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard runtime error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-200 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">System Console Error</h2>
        <p className="text-xs text-slate-500">
          {error.message || "An unexpected error occurred while loading administrative console data."}
        </p>
        <Button
          onClick={() => reset()}
          variant="emerald"
          size="sm"
          className="gap-2 text-xs font-semibold cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reload Component
        </Button>
      </div>
    </div>
  );
}
