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

// ─── Product (Marketplace listing) ───────────────────────────────────────────
export interface Product {
  _id: string;
  productName: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  avgRating: number;
  ratingCount: number;
  bulkAvailable?: boolean;
  bulkQuantity?: number;
  bulkPrice?: number;
  seller?: { _id: string; name: string; email: string };
  isDeleted: boolean;
  createdAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export type PaymentStatus = 'failed' | 'paid' | 'pending';

// الـ item كما بيرجعه الباك (متخزن في الـ order مباشرة)
export interface OrderItem {
  productId:   string;          // الباك بيخزنه كـ ObjectId → string
  productName: string;
  quantity:    number;
  price:       number;
  imageUrl?:   string;
}

// الـ Order كما بيرجعه الباك
export interface Order {
  _id:             string;
  userId:          string;
  items:           OrderItem[];
  shippingAddress: string;
  totalPrice:      number;
  status:          OrderStatus;
  paymentStatus?:  PaymentStatus;
  paymentMethod?:  'card' | 'wallet' | 'COD';
  paymobOrderId?:  string;
  isDeleted?:      boolean;
  createdAt:       string;
  updatedAt?:      string;
}

export interface PlaceOrderRequest {
  items: { product: string; quantity: number }[];
  shippingAddress: string;
}

// ─── Buyer Profile ────────────────────────────────────────────────────────────
export interface BuyerProfile {
  _id:       string;
  user:      string;
  company?:  string;
  address?:  string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerUser {
  _id:        string;
  name:       string;
  email:      string;
  phone?:     string;
  role:       'buyer';
  isVerified: boolean;
  status:     string;
  createdAt:  string;
}

export interface BuyerMyInfoResponse {
  user:    BuyerUser;
  profile: BuyerProfile;
}

// ─── Status Config ────────────────────────────────────────────────────────────
export interface StatusConfig {
  label: string;
  bg:    string;
  color: string;
}

export interface BuyerProfileData {
  _id: string;
  user: string;
  company?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerUserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer';
  isVerified: boolean;
  status: string;
  createdAt: string;
}