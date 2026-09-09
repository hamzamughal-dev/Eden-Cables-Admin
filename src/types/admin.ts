export type ProductRequestStatus = "pending" | "contacted" | "completed" | "cancelled";

export interface CategoryRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  discount: number; 
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductRequestRecord {
  id: string;
  full_name: string;
  phone: string;
  product_id: string;
  requirements: string | null;
  created_at: string;
  status: ProductRequestStatus;
  product?: {
    name: string;
    price: number;
    discount: number;
  };
}

export interface SafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AdminDashboardMetric {
  title: string;
  value: string | number;
  changePercentage?: number;
  changeType?: "increase" | "decrease" | "neutral";
  period?: string;
  iconName?: string;
}
