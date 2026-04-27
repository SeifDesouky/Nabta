import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AddToCartRequest, Cart, CartItem } from '../../models/cart.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IProduct } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

   private readonly BASE_URL = `${environment.apiUrl}cart`;

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // GET /cart/view_cart
  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.BASE_URL}/view_cart`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // POST /cart/  body: { productId, quantity }
  addItem(payload: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.BASE_URL}/`, payload).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  // PATCH /cart/remove_item/:slug  (decrements qty by 1 or removes)
  removeItem(slug: string): Observable<Cart> {
    return this.http.patch<Cart>(`${this.BASE_URL}/remove_item/${slug}`, {}).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  // DELETE /cart/  clears whole cart
  clearCart(): Observable<string> {
    return this.http.delete<string>(`${this.BASE_URL}/`).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  // ── Computed helpers ──────────────────────────────────────────
  getSubtotal(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getEstimatedTax(subtotal: number, rate = 0.08): number {
    return parseFloat((subtotal * rate).toFixed(2));
  }

  getTotal(items: CartItem[]): number {
    const sub = this.getSubtotal(items);
    return parseFloat((sub + this.getEstimatedTax(sub)).toFixed(2));
  }

  get currentCart(): Cart | null {
    return this.cartSubject.getValue();
  }

  // ── Bulk Helpers (استخدمهم في أي كومبوننت) ──────────────────

/**
 * بيحسب السعر الصح بناءً على الكمية
 * لو الكمية وصلت لـ bulkQuantity → bulkPrice، غيره → price عادي
 */
getEffectivePrice(product: IProduct, quantity: number): number {
  if (product.bulkAvailable && quantity >= product.bulkQuantity!) {
    return product.bulkPrice!;
  }
  return product.price;
}

/**
 * هل الـ bulk discount شغال دلوقتي؟
 */
isBulkActive(product: IProduct, quantity: number): boolean {
  return !!(product.bulkAvailable && quantity >= product.bulkQuantity!);
}

/**
 * كام وحدة باقية لتفعيل الـ bulk discount
 */
remainingForBulk(product: IProduct, quantity: number): number {
  if (!product.bulkAvailable) return 0;
  return Math.max(product.bulkQuantity! - quantity, 0);
}

/**
 * نسبة التقدم نحو الـ bulk discount (0 → 100)
 */
bulkProgress(product: IProduct, quantity: number): number {
  if (!product.bulkAvailable) return 0;
  return Math.min((quantity / product.bulkQuantity!) * 100, 100);
}

/**
 * السعر الإجمالي للـ line item مع مراعاة الـ bulk
 */
getLineTotal(product: IProduct, quantity: number): number {
  return this.getEffectivePrice(product, quantity) * quantity;
}

}
