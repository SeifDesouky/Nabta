import { Component } from '@angular/core';
import { IProduct } from '../../../../core/models/product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarketService } from '../../../../core/services/market/market.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  product: IProduct | null = null;
  loading = true;
  error = '';
  addingToCart = false;
  cartSuccess = false;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketService: MarketService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.marketService.getProductBySlug(slug).subscribe({
      next: (res: any) => {
        // بعض الـ APIs بترجع { product: {...} } أو { data: {...} }
        this.product = res?.product ?? res?.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load product.';
        this.loading = false;
      }
    });
  }

  // ── Quantity Controls ─────────────────────────────
  increment(): void {
    if (!this.product) return;
    if (this.quantity < this.product.stock) this.quantity++;
  }

  decrement(): void {
    if (this.quantity > 1) this.quantity--;
  }

  onQuantityInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (isNaN(val) || val < 1) { this.quantity = 1; return; }
    if (this.product && val > this.product.stock) { this.quantity = this.product.stock; return; }
    this.quantity = val;
  }

  // ── Bulk Logic — من السيرفيس ──────────────────────
  get isBulk(): boolean {
    if (!this.product) return false;
    return this.cartService.isBulkActive(this.product, this.quantity);
  }

  get unitPrice(): number {
    if (!this.product) return 0;
    return this.cartService.getEffectivePrice(this.product, this.quantity);
  }

  get lineTotal(): number {
    if (!this.product) return 0;
    return this.cartService.getLineTotal(this.product, this.quantity);
  }

  get bulkProgress(): number {
    if (!this.product) return 0;
    return this.cartService.bulkProgress(this.product, this.quantity);
  }

  get remaining(): number {
    if (!this.product) return 0;
    return this.cartService.remainingForBulk(this.product, this.quantity);
  }

  // ── Add to Cart ───────────────────────────────────
  addToCart(): void {
    if (!this.product || this.addingToCart) return;
    this.addingToCart = true;
    this.cartSuccess = false;

    this.cartService.addItem({
      productId: this.product._id,
      quantity: this.quantity
    }).subscribe({
      next: () => {
        this.addingToCart = false;
        this.cartSuccess = true;
        setTimeout(() => {
          this.cartSuccess = false;
          this.router.navigate(['/marketplace/cart']);
        }, 1500);
      },
      error: (err) => {
        this.addingToCart = false;
        console.error(err);
      }
    });
  }
}
