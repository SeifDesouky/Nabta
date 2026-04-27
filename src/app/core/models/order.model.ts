export type OrderStatus = 'pending' | 'rejected' | 'shipped' | 'delivered' | 'canceled';
export type PaymentStatus = 'failed' | 'paid' | 'pending';
export type PaymentMethod = 'card' | 'wallet' | 'COD';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymobOrderId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MakeOrderRequest {
  shippingAddress: string;
}

export interface MakeOrderResponse {
  order: Order;
  paymentUrl: string;
}
