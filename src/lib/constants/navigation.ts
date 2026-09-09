import { NavigationSection } from "@/types";

export const ADMIN_NAV_SECTIONS: NavigationSection[] = [
  {
    title: "Navigation",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        iconName: "LayoutDashboard",
        exact: true,
      },
      {
        title: "Products",
        href: "/products",
        iconName: "Package",
      },
      {
        title: "Categories",
        href: "/categories",
        iconName: "Layers",
      },
      {
        title: "Requests",
        href: "/requests",
        iconName: "ShoppingCart",
      },
    ],
  },
];
