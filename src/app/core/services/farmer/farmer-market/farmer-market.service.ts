import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { IProduct, IOrder, CreateProductRequest } from '../../../models/farmer/farmer-market.model';
    import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FarmerMarketService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _myProducts$      = new BehaviorSubject<IProduct[]>([]);
  private readonly _myOrders$        = new BehaviorSubject<IOrder[]>([]);
  private readonly _productsLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _ordersLoading$   = new BehaviorSubject<boolean>(false);
  private readonly _addLoading$      = new BehaviorSubject<boolean>(false);

  // ── Observables ────────────────────────────────────────────────────────────
  readonly myProducts$      = this._myProducts$.asObservable();
  readonly myOrders$        = this._myOrders$.asObservable();
  readonly productsLoading$ = this._productsLoading$.asObservable();
  readonly ordersLoading$   = this._ordersLoading$.asObservable();
  readonly addLoading$      = this._addLoading$.asObservable();

  // ── Products ───────────────────────────────────────────────────────────────

  /** GET /product/my_products */
  loadMyProducts(): void {
    this._productsLoading$.next(true);
    this.http.get<IProduct[]>(`${this.BASE}product/my_products`)
      .pipe(catchError(() => of([])))
      .subscribe(products => {
        this._myProducts$.next(products);
        this._productsLoading$.next(false);
      });
  }

  /** POST /product  (multipart/form-data with image) */
  addProduct(data: CreateProductRequest): Observable<IProduct> {
    this._addLoading$.next(true);
    const form = new FormData();
    form.append('productName', data.productName);
    form.append('price',       String(data.price));
    form.append('stock',       String(data.stock));
    if (data.description)  form.append('description',  data.description);
    if (data.category)     form.append('category',     data.category);
    if (data.bulkAvailable !== undefined) form.append('bulkAvailable', String(data.bulkAvailable));
    if (data.bulkQuantity !== undefined)  form.append('bulkQuantity',  String(data.bulkQuantity));
    if (data.bulkPrice    !== undefined)  form.append('bulkPrice',     String(data.bulkPrice));
 if (Array.isArray(data.features) && data.features.length > 0) {
  data.features.forEach(f => form.append('features', f));
} else {
  form.append('features', JSON.stringify([]));
}
    if (data.img) form.append('img', data.img);

    return this.http.post<IProduct>(`${this.BASE}product/`, form).pipe(
      tap(product => {
        this._myProducts$.next([product, ...this._myProducts$.getValue()]);
        this._addLoading$.next(false);
      }),
      catchError(err => { this._addLoading$.next(false); throw err; })
    );
  }

  /** PATCH /product/delete/:id  (soft delete toggle) */
  toggleDeleteProduct(id: string): Observable<IProduct> {
    return this.http.patch<IProduct>(`${this.BASE}product/delete/${id}`, {}).pipe(
      tap(updated => {
        this._myProducts$.next(
          this._myProducts$.getValue().map(p => p._id === id ? updated : p)
        );
      })
    );
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  /** GET /order/orders  (orders that contain farmer's products) */
  loadMyOrders(): void {
    this._ordersLoading$.next(true);
    this.http.get<IOrder[]>(`${this.BASE}order/orders`)
      .pipe(catchError(() => of([])))
      .subscribe(orders => {
        this._myOrders$.next(orders);
        this._ordersLoading$.next(false);
      });
  }

  /** PATCH /order/status/:id */
  updateOrderStatus(orderId: string, status: string): Observable<IOrder> {
    return this.http.patch<IOrder>(`${this.BASE}order/status/${orderId}`, { status }).pipe(
      tap(updated => {
        this._myOrders$.next(
          this._myOrders$.getValue().map(o => o._id === orderId ? { ...o, status: updated.status } : o)
        );
      })
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getStatusConfig(status: string): { label: string; bg: string; color: string } {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      pending:   { label: 'Pending',   bg: 'rgba(255,160,0,0.10)',  color: '#b36b00' },
      shipped:   { label: 'Shipped',   bg: 'rgba(13,99,27,0.10)',   color: '#0d631b' },
      delivered: { label: 'Delivered', bg: 'rgba(13,99,27,0.15)',   color: '#005312' },
      rejected:  { label: 'Rejected',  bg: 'rgba(211,47,47,0.10)',  color: '#c62828' },
      canceled:  { label: 'Canceled',  bg: '#eeeeee',               color: '#40493d' },
    };
    return map[status] ?? { label: status, bg: '#eee', color: '#666' };
  }
}