import React from "react";
import Link from "next/link";
import { ProductRequestRecord } from "@/types/admin";
import { RequestStatusBadge } from "@/components/admin/RequestStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ArrowRight,
  Phone,
  Package,
  Calendar,
  Inbox,
} from "lucide-react";

interface RecentRequestItem extends ProductRequestRecord {
  product?: {
    id?: string;
    name: string;
    price: number;
    discount: number;
    category?: {
      id?: string;
      name: string;
    };
  };
}

interface RecentRequestsCardProps {
  recentRequests: RecentRequestItem[];
}

export function RecentRequestsCard({
  recentRequests,
}: RecentRequestsCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="p-5 border-b border-slate-200 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Recent Product Inquiries
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest quote inquiries received from the public storefront
            </p>
          </div>
        </div>

        <Link href="/requests">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300 gap-1.5"
          >
            <span>View All Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {recentRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Inbox className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No customer inquiries yet
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When customers submit quote inquiries through the public catalog, they will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Customer
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Requested Product
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Requirements
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Submitted
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
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

                    {/* Product */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">
                        {req.product?.name || "Product Quote"}
                      </div>
                      {req.product?.category?.name && (
                        <Badge variant="cyan" className="text-[10px] py-0 mt-0.5">
                          {req.product.category.name}
                        </Badge>
                      )}
                    </td>

                    {/* Requirements snippet */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {req.requirements || (
                          <span className="italic text-slate-400">No notes</span>
                        )}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <RequestStatusBadge status={req.status} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>

                    {/* Quick Link */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link href="/requests">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-[#e01b22] hover:text-[#b3121a] hover:bg-red-50 cursor-pointer"
                        >
                          Manage &rarr;
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
