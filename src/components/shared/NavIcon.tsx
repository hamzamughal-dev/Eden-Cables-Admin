import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  PackageCheck,
  FileText,
  User,
  Shield,
  Layers,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Bell,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  PackageCheck,
  FileText,
  User,
  Shield,
  Layers,
  HelpCircle,
  TrendingUp,
  CreditCard,
  Bell,
};

interface NavIconProps {
  name: string;
  className?: string;
}

export function NavIcon({ name, className = "h-5 w-5" }: NavIconProps) {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
}
