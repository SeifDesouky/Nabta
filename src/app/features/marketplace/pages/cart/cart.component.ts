import { Component } from '@angular/core';
import { Cart, CartItem } from '../../../../core/models/cart.model';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../../core/services/cart/cart.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { FarmerProfileService } from '../../../../core/services/farmer/farmer-profile/farmer-profile.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
cart: Cart | null = null;
  loading = false;
currentUserName   = '';
  currentUserAvatar = '';
  currentUserRole   = localStorage.getItem('role') || 'farmer';
  unreadCount       = 0;
  // map من productId → الـ quantity اللي اليوزر بيعدلها locally
  quantityInputs: Record<string, number> = {};

  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService,
    private farmerProfileService: FarmerProfileService,
    private notifService: NotificationService,
    private router: Router) {}

  ngOnInit(): void {
    this.fetchCart();
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        // sync الـ inputs مع الـ cart الجديد
        cart?.items.forEach(item => {
          this.quantityInputs[item.productId] = item.quantity;
        });
      });

      this.farmerProfileService.loadProfile();
    this.farmerProfileService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUserName   = user.name  ?? '';
        this.currentUserAvatar = user.avatar ?? user.profileImage ?? '';
      }
    });

    // Unread notifications count
    this.notifService.getUnreadCount().subscribe({
      next: count => (this.unreadCount = count),
      error: err  => console.error(err),
    });
  }
goToProfile(): void {
    this.router.navigate([`/${this.currentUserRole}/profile`]);
  }
  fetchCart(): void {
    this.loading = true;
    this.cartService.loadCart().subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false)
    });
  }

  // ── Quantity Controls ─────────────────────────────
  increment(item: CartItem): void {
    const current = this.quantityInputs[item.productId] ?? item.quantity;
    this.quantityInputs[item.productId] = current + 1;
    this.cartService.addItem({ productId: item.productId, quantity: 1 }).subscribe();
  }

  decrement(item: CartItem): void {
    // ← Fix: بنبعت slug مش productId
    this.cartService.removeItem(item.slug).subscribe();
  }

  // لما اليوزر يغير الـ input يدوياً
  onQuantityInput(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQty = parseInt(input.value, 10);
    if (isNaN(newQty) || newQty < 1) return;

    const diff = newQty - item.quantity;
    if (diff === 0) return;

    if (diff > 0) {
      // زيادة
      this.cartService.addItem({ productId: item.productId, quantity: diff }).subscribe();
    } else {
      // نقصان — بنبعت PATCH بعدد المرات اللي المفروض ننقص فيها
      // الباك بينقص 1 في كل call، فبنعمل loop
      const calls = Math.abs(diff);
      for (let i = 0; i < calls; i++) {
        this.cartService.removeItem(item.slug).subscribe();
      }
    }
  }

  removeItem(item: CartItem): void {
    // بيشيل الأيتم كله بغض النظر عن الكمية
    const calls = item.quantity;
    for (let i = 0; i < calls; i++) {
      this.cartService.removeItem(item.slug).subscribe();
    }
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  // ── Bulk Helpers للـ template ─────────────────────
  getBulkProgress(item: CartItem): number {
    // محتاجين bulkQuantity — بنحطها في CartItem لو الباك بيرجعها
    // لو مش موجودة هيرجع 0
    const bq = (item as any).bulkQuantity;
    if (!bq) return 0;
    return Math.min((item.quantity / bq) * 100, 100);
  }

  isBulkActive(item: CartItem): boolean {
    const bq = (item as any).bulkQuantity;
    if (!bq) return false;
    return item.quantity >= bq;
  }

  getRemainingForBulk(item: CartItem): number {
    const bq = (item as any).bulkQuantity;
    if (!bq) return 0;
    return Math.max(bq - item.quantity, 0);
  }

  getBulkPrice(item: CartItem): number {
    return (item as any).bulkPrice ?? item.price;
  }

  hasBulk(item: CartItem): boolean {
    return !!(item as any).bulkAvailable;
  }

  // ── Order Summary ─────────────────────────────────
  get subtotal(): number {
    return this.cart ? this.cartService.getSubtotal(this.cart.items) : 0;
  }

  get tax(): number {
    return this.cartService.getEstimatedTax(this.subtotal);
  }

  get total(): number {
    return this.cartService.getTotal(this.cart?.items ?? []);
  }

  get itemCount(): number {
    return this.cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
