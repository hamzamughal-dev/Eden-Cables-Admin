import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald" | "red";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "red",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e01b22] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-[6px] cursor-pointer text-center";

    const variants = {
      red: "bg-[#e01b22] text-white hover:bg-[#b3121a] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] shadow-sm active:translate-y-0",
      primary: "bg-[#e01b22] text-white hover:bg-[#b3121a] hover:-translate-y-0.5 shadow-sm active:translate-y-0",
      emerald: "bg-[#e01b22] text-white hover:bg-[#b3121a] hover:-translate-y-0.5 shadow-sm active:translate-y-0",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 shadow-2xs",
      outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-2xs",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
      danger: "bg-[#b3121a] text-white hover:bg-[#8e0e14] shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
