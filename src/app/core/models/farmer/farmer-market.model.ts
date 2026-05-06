// ─── Product ──────────────────────────────────────────────────────────────────
export interface IProduct {
  _id: string;
  productName: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
  features?: string[];
  farmer: string;
  imageUrl?: string;
  slug: string;
  bulkAvailable?: boolean;
  bulkQuantity?: number;
  bulkPrice?: number;
  isDeleted: boolean;
  avgRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  productName: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
  features?: string[];
  bulkAvailable?: boolean;
  bulkQuantity?: number;
  bulkPrice?: number;
  img?: File;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'rejected' | 'shipped' | 'delivered' | 'canceled';
export type PaymentStatus = 'failed' | 'paid' | 'pending';

export interface OrderItem {
  productId: { _id: string; productName: string; price: number; imageUrl?: string; farmer?: string };
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'card' | 'wallet' | 'COD';
  paymobOrderId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}