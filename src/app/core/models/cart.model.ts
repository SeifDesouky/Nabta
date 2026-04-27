export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  slug: string; // ← مهم للـ PATCH
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}
