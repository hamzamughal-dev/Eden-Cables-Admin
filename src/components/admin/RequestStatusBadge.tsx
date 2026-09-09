import React from "react";
import { ProductRequestStatus } from "@/types/admin";
import { Clock, PhoneCall, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestStatusBadgeProps {
  status: ProductRequestStatus;
  className?: string;
  showIcon?: boolean;
}

export function RequestStatusBadge({
  status,
  className,
  showIcon = true,
}: RequestStatusBadgeProps) {
  const config = {
    pending: {
      label: "Pending Review",
      icon: Clock,
      style:
        "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/20",
    },
    contacted: {
      label: "Customer Contacted",
      icon: PhoneCall,
      style:
        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      style:
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      style:
        "bg-slate-700/40 text-slate-300 border-slate-700 hover:bg-slate-700/60",
    },
  }[status] || {
    label: status,
    icon: Clock,
    style: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
        config.style,
        className
      )}
    >
      {showIcon && <IconComponent className="h-3 w-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
