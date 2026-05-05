import { Component } from '@angular/core';
import { CreateReviewRequest, IProduct, IReview } from '../../../../core/models/product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarketService } from '../../../../core/services/market/market.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
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

// Properties جديدة:
reviews: IReview[]     = [];
relatedProducts: any[] = [];
loadingReviews         = false;

// Review form
userRating   = 0;
userComment  = '';
submittingReview = false;
reviewSuccess    = false;
reviewError      = '';
hoveredStar      = 0;

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
      this.product = res?.product ?? res?.data ?? res;
      this.loading = false;
      if (this.product) {
        this.loadRelated(slug);
      }
    },
    error: () => { this.error = 'Failed to load product.'; this.loading = false; }
  });
    
  }
  loadRelated(slug: string): void {
  this.marketService.getRelatedProducts(slug).subscribe({
    next: (res: any) => this.relatedProducts = res ?? [],
    error: () => {}
  });
}

setRating(star: number): void  { this.userRating = star; }
hoverStar(star: number): void  { this.hoveredStar = star; }
clearHover(): void             { this.hoveredStar = 0; }

getStarFill(star: number): string {
  const active = this.hoveredStar || this.userRating;
  return star <= active ? "'FILL' 1" : "'FILL' 0";
}

// ── Submit Review ─────────────────────────────────
submitReview(): void {
  if (!this.product || !this.userRating || this.submittingReview) return;
  this.submittingReview = true;
  this.reviewError      = '';

  const payload: CreateReviewRequest = {
    product: this.product._id,
    rating:  this.userRating,
    comment: this.userComment.trim() || undefined
  };

  this.marketService.createReview(payload).subscribe({
    next: (review) => {
      this.submittingReview = false;
      this.reviewSuccess    = true;
      this.userRating       = 0;
      this.userComment      = '';
      // تحديث الـ rating في الـ product محلياً
      if (this.product) {
        const total = (this.product.avgRating * this.product.ratingCount) + review.rating;
        this.product.ratingCount++;
        this.product.avgRating = parseFloat((total / this.product.ratingCount).toFixed(1));
      }
      setTimeout(() => this.reviewSuccess = false, 3000);
    },
    error: (err) => {
      this.submittingReview = false;
      this.reviewError = err?.error?.message ?? 'Failed to submit review.';
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
