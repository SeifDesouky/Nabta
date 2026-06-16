import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  BuyerMyInfoResponse,
  BuyerUser,
  BuyerProfile,
  Order,
  Product,
  StatusConfig,
  OrderStatus,
} from '../../../models/buyer/buyer.model';
import { ApiServiceService } from '../../API/api-service.service';

@Injectable({ providedIn: 'root' })
export class BuyerDashboardService {
  private readonly api = inject(ApiServiceService);

  // ── User ──────────────────────────────────────────────────────────────────
  private readonly _user$    = new BehaviorSubject<BuyerUser | null>(null);
  private readonly _profile$ = new BehaviorSubject<BuyerProfile | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  readonly user$    = this._user$.asObservable();
  readonly profile$ = this._profile$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  get user(): BuyerUser | null { return this._user$.value; }

  // ── Orders ────────────────────────────────────────────────────────────────
  private readonly _myOrders$      = new BehaviorSubject<Order[]>([]);
  private readonly _ordersLoading$ = new BehaviorSubject<boolean>(false);

  readonly myOrders$      = this._myOrders$.asObservable();
  readonly ordersLoading$ = this._ordersLoading$.asObservable();

  // ── Products ──────────────────────────────────────────────────────────────
  private readonly _products$        = new BehaviorSubject<Product[]>([]);
  private readonly _productsLoading$ = new BehaviorSubject<boolean>(false);

  readonly products$        = this._products$.asObservable();
  readonly productsLoading$ = this._productsLoading$.asObservable();

  // ─────────────────────────────────────────────────────────────────────────
  //  LOAD METHODS
  // ─────────────────────────────────────────────────────────────────────────

  loadDashboard(): void {
    this._loading$.next(true);
    this.api.get<BuyerMyInfoResponse>('user/myInfo').subscribe({
      next: res => {
        this._user$.next(res.user);
        this._profile$.next(res.profile);
        this._loading$.next(false);
      },
      error: () => this._loading$.next(false),
    });
  }

  loadMyOrders(): void {
    this._ordersLoading$.next(true);
    this.api.get<Order[]>('order/my_orders').subscribe({
      next: data => {
        this._myOrders$.next(Array.isArray(data) ? data : []);
        this._ordersLoading$.next(false);
      },
      error: () => this._ordersLoading$.next(false),
    });
  }

  loadProducts(params?: { category?: string; search?: string }): void {
    this._productsLoading$.next(true);
    let url = 'product';
    const q: string[] = [];
    if (params?.category) q.push(`category=${params.category}`);
    if (params?.search)   q.push(`search=${params.search}`);
    if (q.length) url += '?' + q.join('&');

    this.api.get<{ products: Product[] } | Product[]>(url).subscribe({
      next: data => {
        const list = Array.isArray(data) ? data : (data as any).products ?? [];
        this._products$.next(list);
        this._productsLoading$.next(false);
      },
      error: () => this._productsLoading$.next(false),
    });
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.api.patch(`order/${orderId}/cancel`, {}).pipe(
      tap(() => {
        const updated = this._myOrders$.value.map(o =>
          o._id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
        );
        this._myOrders$.next(updated);
      })
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  get firstName(): string {
    return this._user$.value?.name?.split(' ')[0] || 'Buyer';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  getStatusConfig(status: OrderStatus): StatusConfig {
    const map: Record<OrderStatus, StatusConfig> = {
      pending:   { label: 'Pending',   bg: 'rgba(245,158,11,0.12)',  color: '#b45309' },
      shipped:   { label: 'Shipped',   bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
      delivered: { label: 'Delivered', bg: 'rgba(13,99,27,0.12)',    color: '#0d631b' },
      rejected:  { label: 'Rejected',  bg: 'rgba(220,38,38,0.10)',   color: '#b91c1c' },
      cancelled: { label: 'Cancelled', bg: 'rgba(107,114,128,0.12)', color: '#374151' },
    };
    return map[status] ?? { label: status, bg: '#eee', color: '#333' };
  }

  getOrderStats(orders: Order[]) {
    return {
      total:      orders.length,
      pending:    orders.filter(o => o.status === 'pending').length,
      shipped:    orders.filter(o => o.status === 'shipped').length,
      delivered:  orders.filter(o => o.status === 'delivered').length,
      cancelled:  orders.filter(
        o => o.status === 'cancelled' || o.status === 'rejected'
      ).length,
      totalSpent: orders
        .filter(o => o.status === 'delivered')
        .reduce((s, o) => s + o.totalPrice, 0),
    };
  }
}