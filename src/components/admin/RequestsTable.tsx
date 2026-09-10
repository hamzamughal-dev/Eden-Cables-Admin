"use client";

import React, { useState } from "react";
import { ProductRequestRecord, ProductRequestStatus } from "@/types/admin";
import { RequestStatusBadge } from "@/components/admin/RequestStatusBadge";
import { RequestDetailsModal } from "@/components/admin/RequestDetailsModal";
import { DeleteRequestModal } from "@/components/admin/DeleteRequestModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseQuoteDetails } from "@/lib/utils/quote";
import {
  Search,
  Phone,
  Calendar,
  Package,
  Layers,
  FileText,
  Eye,
  Trash2,
  Inbox,
  Filter,
  RefreshCw,
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

interface RequestsTableProps {
  initialRequests: ExtendedProductRequest[];
  initialCounts?: {
    all: number;
    pending: number;
    contacted: number;
    completed: number;
    cancelled: number;
  };
}

export function RequestsTable({
  initialRequests,
  initialCounts = {
    all: initialRequests.length,
    pending: initialRequests.filter((r) => r.status === "pending").length,
    contacted: initialRequests.filter((r) => r.status === "contacted").length,
    completed: initialRequests.filter((r) => r.status === "completed").length,
    cancelled: initialRequests.filter((r) => r.status === "cancelled").length,
  },
}: RequestsTableProps) {
  const [requests, setRequests] =
    useState<ExtendedProductRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<ExtendedProductRequest | null>(null);
  const [deletingRequest, setDeletingRequest] =
    useState<ExtendedProductRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    completed: requests.filter((r) => r.status === "completed").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab !== "all" && req.status !== activeTab) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesName = req.full_name.toLowerCase().includes(query);
    const matchesPhone = req.phone.toLowerCase().includes(query);
    const matchesProduct = req.product?.name?.toLowerCase().includes(query);
    const matchesRequirements =
      req.requirements && req.requirements.toLowerCase().includes(query);

    return matchesName || matchesPhone || matchesProduct || matchesRequirements;
  });

  const handleStatusUpdate = (id: string, newStatus: ProductRequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    setToastMessage(`Request status updated to "${newStatus}".`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    const deleted = requests.find((r) => r.id === deletedId);
    setRequests((prev) => prev.filter((r) => r.id !== deletedId));
    setToastMessage(
      `Inquiry from "${deleted?.full_name || "Customer"}" was deleted.`
    );
    setTimeout(() => setToastMessage(null), 3500);
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

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All Inquiries", count: counts.all },
    { key: "pending", label: "Pending Review", count: counts.pending },
    { key: "contacted", label: "Contacted", count: counts.contacted },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

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

      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#e01b22]/10 text-[#e01b22] border border-[#e01b22]/30 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive
                    ? "bg-[#e01b22]/20 text-[#b3121a]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, product title, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e01b22] focus:ring-1 focus:ring-[#e01b22]"
          />
        </div>
        <div className="text-xs text-slate-500 self-center">
          Showing <strong className="text-slate-900">{filteredRequests.length}</strong> of{" "}
          <strong className="text-slate-900">{requests.length}</strong> inquiries
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Customer
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Requested Product
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Requirements
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-center">
                  Status
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold">
                  Submitted Date
                </th>
                <th scope="col" className="py-3.5 px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    <Inbox className="mx-auto h-9 w-9 text-slate-400 mb-2" />
                    <p className="text-base font-semibold text-slate-700">
                      No customer inquiries found
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchQuery || activeTab !== "all"
                        ? "Try clearing your search query or selecting a different status filter tab."
                        : "When customers submit quote requests from the storefront, they will appear here in real-time."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Customer */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 group-hover:text-[#e01b22] transition-colors">
                          {req.full_name}
                        </div>
                        <a
                          href={`tel:${req.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#e01b22] font-mono mt-0.5"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{req.phone}</span>
                        </a>
                      </td>

                      {/* Product / Quote Items */}
                      <td className="py-4 px-4 max-w-sm">
                        {(() => {
                          const quote = parseQuoteDetails(req.requirements, req.product);
                          if (quote.items.length > 1) {
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[10px] bg-red-50 text-[#e01b22] px-2 py-0.5 rounded border border-red-200">
                                    {quote.items.length} Specifications
                                  </span>
                                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[200px]" title={quote.items.map((i) => i.product_name).join(", ")}>
                                    {quote.items[0].product_name} &amp; {quote.items.length - 1} more
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-mono font-bold text-[#e01b22]">
                                    {formatCurrency(quote.totalEstimatedCost)}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    ({quote.items.map((it) => `${it.quantity}${it.unit === "coil" ? "c" : "m"}`).join(", ")})
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          const singleItem = quote.items[0];
                          return (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-900 truncate max-w-xs flex items-center gap-1.5">
                                {singleItem?.dimension && (
                                  <span className="font-mono text-[10px] font-extrabold text-[#e01b22] bg-red-50 px-1.5 py-0.2 rounded border border-red-200 shrink-0">
                                    {singleItem.dimension}
                                  </span>
                                )}
                                <span className="truncate">{singleItem?.product_name || req.product?.name || "Conductor"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-mono font-bold text-slate-900">
                                  {formatCurrency(quote.totalEstimatedCost)}
                                </span>
                                {singleItem && (
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    ({singleItem.quantity} {singleItem.unit === "coil" ? "Coil (90m)" : "Meters"})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        {(() => {
                          const quote = parseQuoteDetails(req.requirements, req.product);
                          return (
                            <p
                              className="text-xs text-slate-500 line-clamp-2 cursor-pointer hover:text-slate-900 transition-colors"
                              onClick={() => setSelectedRequest(req)}
                              title="Click to view full notes"
                            >
                              {quote.requirementsNotes || (
                                <span className="italic text-slate-400">
                                  Standard commercial delivery requirements
                                </span>
                              )}
                            </p>
                          );
                        })()}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="cursor-pointer transition-transform active:scale-95"
                          title="Click to change status"
                        >
                          <RequestStatusBadge status={req.status} />
                        </button>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(req)}
                            className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300 cursor-pointer"
                            title="View inquiry details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingRequest(req)}
                            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-300 cursor-pointer"
                            title="Delete inquiry"
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
            Active Customer Inquiries Console
          </span>
          <span className="text-slate-500">
            Default Status: <strong className="text-amber-700">pending</strong>
          </span>
        </div>
      </div>

      <RequestDetailsModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onStatusUpdate={handleStatusUpdate}
      />

      <DeleteRequestModal
        request={deletingRequest}
        isOpen={Boolean(deletingRequest)}
        onClose={() => setDeletingRequest(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
