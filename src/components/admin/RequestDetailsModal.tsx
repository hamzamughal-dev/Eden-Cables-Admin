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
import { parseQuoteDetails } from "@/lib/utils/quote";

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

  const quoteDetails = parseQuoteDetails(request.requirements, request.product);

  const handleStatusChange = (newStatus: ProductRequestStatus) => {
    if (newStatus === request.status || updateStatusMutation.isPending) return;
    setStatusError(null);
    setPendingStatusTarget(newStatus);
    updateStatusMutation.mutate({ id: request.id, status: newStatus });
  };

  const updatingStatus = updateStatusMutation.isPending;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

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
                className="inline-flex items-center gap-1.5 text-[#e01b22] hover:underline font-mono font-semibold"
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

          {/* Requested Items & Specifications Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-[#e01b22]" />
                Requested Items &amp; Quantities ({quoteDetails.items.length})
              </h3>
              <span className="font-mono text-xs text-slate-500">
                Total Estimate: <strong className="text-slate-900 font-bold">{formatCurrency(quoteDetails.totalEstimatedCost)}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Cable Specification</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Estimated Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quoteDetails.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {item.dimension && (
                            <span className="font-mono text-[10px] font-extrabold text-[#e01b22] bg-red-50 px-1.5 py-0.2 rounded border border-red-200 shrink-0">
                              {item.dimension}
                            </span>
                          )}
                          <span>{item.product_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.unit === "coil"
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {item.unit === "coil" ? "Coil (90m)" : "Meter"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(item.unit_price)}/m
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#23262b]">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/80 border-t border-slate-200">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      Total Estimated Value:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-sm text-[#e01b22]">
                      {formatCurrency(quoteDetails.totalEstimatedCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer Requirements Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Run Length, Voltage &amp; Delivery Requirements
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {quoteDetails.requirementsNotes || (
                <span className="italic text-slate-400">
                  No additional voltage or delivery requirements specified by customer.
                </span>
              )}
            </div>
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
