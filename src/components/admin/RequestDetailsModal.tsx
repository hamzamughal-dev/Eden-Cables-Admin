"use client";

import React, { useState } from "react";
import { ProductRequestRecord, ProductRequestStatus } from "@/types/admin";
import { RequestStatusBadge } from "@/components/admin/RequestStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Phone,
  Calendar,
  Package,
  Layers,
  FileText,
  User,
  Loader2,
  DollarSign,
  Check,
} from "lucide-react";

interface ExtendedProductRequest extends ProductRequestRecord {
  product?: {
    id?: string;
    name: string;
    price: number;
    discount: number;
    quantity?: number;
    category?: {
      id?: string;
      name: string;
    };
  };
}

interface RequestDetailsModalProps {
  request: ExtendedProductRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, newStatus: ProductRequestStatus) => void;
}

import { useUpdateRequestStatusMutation } from "@/hooks/useRequests";

export function RequestDetailsModal({
  request,
  isOpen,
  onClose,
  onStatusUpdate,
}: RequestDetailsModalProps) {
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pendingStatusTarget, setPendingStatusTarget] = useState<ProductRequestStatus | null>(null);

  const updateStatusMutation = useUpdateRequestStatusMutation({
    onSuccess: ({ id, status }) => {
      onStatusUpdate(id, status);
    },
    onError: (err) => {
      setStatusError(err.message);
    },
    onSettled: () => {
      setPendingStatusTarget(null);
    },
  });

  if (!isOpen || !request) return null;

  const handleStatusChange = (newStatus: ProductRequestStatus) => {
    if (newStatus === request.status || updateStatusMutation.isPending) return;
    setStatusError(null);
    setPendingStatusTarget(newStatus);
    updateStatusMutation.mutate({ id: request.id, status: newStatus });
  };

  const updatingStatus = updateStatusMutation.isPending;

  const product = request.product;
  const numPrice = product ? Number(product.price) : 0;
  const numDiscount = product ? Number(product.discount) : 0;
  const effectivePrice = Math.max(0, numPrice * (1 - numDiscount / 100));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const statuses: { value: ProductRequestStatus; label: string }[] = [
    { value: "pending", label: "Pending Review" },
    { value: "contacted", label: "Customer Contacted" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 pr-8">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Customer Quote Inquiry
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {request.full_name}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <a
                href={`tel:${request.phone}`}
                className="inline-flex items-center gap-1.5 text-[#e01b22] hover:underline font-mono"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{request.phone}</span>
              </a>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDate(request.created_at)}</span>
              </span>
            </div>
          </div>

          <div>
            <RequestStatusBadge status={request.status} />
          </div>
        </div>

        {/* Status Error Alert */}
        {statusError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs my-4">
            {statusError}
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Status Update Pipeline Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">
                Update Inquiry Status:
              </span>
              {updatingStatus && (
                <span className="text-xs text-[#e01b22] inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map((s) => {
                const isCurrent = request.status === s.value;
                const isTargetPending = updatingStatus && pendingStatusTarget === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleStatusChange(s.value)}
                    disabled={updatingStatus}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                      isCurrent
                        ? "bg-emerald-50 border-emerald-500/50 text-emerald-700 shadow-2xs"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {isTargetPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e01b22]" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        <span>{s.label}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Requirements Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Requirements & Order Notes
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {request.requirements || (
                <span className="italic text-slate-400">
                  No additional requirements provided by customer.
                </span>
              )}
            </div>
          </div>

          {/* Requested Product Details Card */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              Associated Product from Catalog
            </h3>
            {product ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-base">
                      {product.name}
                    </span>
                    {product.category?.name && (
                      <Badge variant="cyan" className="text-[10px]">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Product ID: <code className="text-[11px] font-mono">{request.product_id}</code>
                  </div>
                </div>

                <div className="text-right sm:shrink-0">
                  <div className="text-lg font-bold text-slate-900">
                    ${effectivePrice.toFixed(2)}
                  </div>
                  {numDiscount > 0 && (
                    <div className="text-xs text-slate-400 line-through">
                      ${numPrice.toFixed(2)} ({numDiscount}% off)
                    </div>
                  )}
                  {product.quantity !== undefined && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Available Stock: <strong className="text-slate-900">{product.quantity}</strong> units
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                Product ID: {request.product_id} (Product details could not be loaded)
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
