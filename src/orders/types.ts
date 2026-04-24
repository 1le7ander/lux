export type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  title: string;
  qty: number;
  price: number;
  image?: string;
}

export interface Customer {
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}
