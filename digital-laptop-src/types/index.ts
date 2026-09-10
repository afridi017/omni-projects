export type Condition = "NEW" | "LIKE_NEW" | "EXCELLENT" | "GOOD";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number | null;
  condition: Condition;
  stock: number;
  processor?: string | null;
  ram?: string | null;
  storage?: string | null;
  gpu?: string | null;
  display?: string | null;
  battery?: string | null;
  description?: string | null;
  warranty?: string | null;
  images: string[];
  featured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  product?: Product;
}

export interface Order {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  paymentMethod: string;
  notes?: string | null;
  orderItems: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductFilters {
  brand?: string;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  search?: string;
  featured?: boolean;
}
