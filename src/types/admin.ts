export type ProductRequestStatus = "pending" | "contacted" | "completed" | "cancelled";

export interface WireTypeRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  category_count?: number;
  product_count?: number;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string | null;
  wire_type_id?: string | null;
  wire_type?: WireTypeRecord | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  dimension?: string | null;
  description: string | null;
  image_url?: string | null;
  quantity?: number;
  price: number;
  discount?: number; 
  category_id: string;
  category?: CategoryRecord | null;
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
    dimension?: string | null;
    price: number;
    discount?: number;
    image_url?: string | null;
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
