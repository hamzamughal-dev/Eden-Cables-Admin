export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeVariant?: "default" | "emerald" | "outline" | "cyan" | "warning" | "info";
  exact?: boolean;
}

export interface NavigationSection {
  title?: string;
  items: NavItem[];
}
