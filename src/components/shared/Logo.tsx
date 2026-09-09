import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  badge?: string;
  href?: string;
}

export function Logo({ className, badge = "Admin", href = "/dashboard" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 transition-all group",
        className
      )}
    >
      <div className="flex items-center justify-center rounded-lg bg-[#262626] px-3 py-1.5 shadow-sm border border-[#3a3d42] group-hover:border-[#e01b22]/60 transition-all">
        <Image
          src="/logo.png"
          alt="Eden Cables"
          width={130}
          height={36}
          className="h-7 sm:h-8 w-auto object-contain"
          priority
        />
      </div>
      {badge && (
        <span className="rounded-[4px] bg-[#e01b22] px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-xs">
          {badge}
        </span>
      )}
    </Link>
  );
}
