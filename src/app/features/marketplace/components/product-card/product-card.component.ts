import { Component, Input, Pipe } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProduct } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart/cart.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input() product!: IProduct;

  quantity     = 1;
  isFavourited = false;
  addingToCart = false;
  cartSuccess  = false;

  constructor(private cartService: CartService) {}

  // ── Bulk helpers (من السيرفيس) ────────────────────────
  get isBulkActive(): boolean {
    return this.cartService.isBulkActive(this.product, this.quantity);
  }

  get effectivePrice(): number {
    return this.cartService.getEffectivePrice(this.product, this.quantity);
  }

  get lineTotal(): number {
    return this.cartService.getLineTotal(this.product, this.quantity);
  }

  get bulkProgress(): number {
    return this.cartService.bulkProgress(this.product, this.quantity);
  }

  get remaining(): number {
    return this.cartService.remainingForBulk(this.product, this.quantity);
  }

  get bulkLabel(): string {
    if (!this.product.bulkAvailable) return '';
    const qty = this.product.bulkQuantity ?? 0;
    if (qty >= 100) return `${qty}+ units`;
    if (qty >= 20)  return `Pallet (${qty}+)`;
    return `Bulk (${qty}+)`;
  }

  get farmerName(): string {
    return this.product.farmer?.name ?? 'Unknown Farm';
  }

  // ── Quantity input guard ──────────────────────────────
  onQuantityChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (isNaN(val) || val < 1)               { this.quantity = 1;                    return; }
    if (val > (this.product.stock ?? 9999))  { this.quantity = this.product.stock;   return; }
    this.quantity = val;
  }
// method لتغيير الـ quantity بالكتابة
onQtyInput(event: Event): void {
  const val = parseInt((event.target as HTMLInputElement).value);
  if (!isNaN(val) && val >= 1) {
    this.quantity = val;
  }
}

increment(): void { this.quantity++; }

decrement(): void { if (this.quantity > 1) this.quantity--; }

  // ── Favourite ─────────────────────────────────────────
  getFavFill(): string {
    return this.isFavourited ? "'FILL' 1" : "'FILL' 0";
  }

  toggleFavourite(event: Event): void {
    event.stopPropagation();
    this.isFavourited = !this.isFavourited;
  }

  // ── Add to Cart ───────────────────────────────────────
addToCart(): void {
  if (this.addingToCart || this.product.stock === 0) return;
  this.addingToCart = true;
  this.cartSuccess  = false;
  this.cartService.addItem({
    productId: this.product._id,
    quantity:  this.quantity
  }).subscribe({
    next: () => {
      this.addingToCart = false;
      this.cartSuccess  = true;
      setTimeout(() => (this.cartSuccess = false), 2500);
      // ← مفيش navigate هنا
    },
    error: () => {
      this.addingToCart = false;
    }
  });
}
}
