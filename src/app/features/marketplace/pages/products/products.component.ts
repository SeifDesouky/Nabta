import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { IProduct } from '../../../../core/models/product.model';
import { MarketService } from '../../../../core/services/market/market.service';
import { Router, RouterLink } from '@angular/router';

interface SortOption {
  label: string;
  value: string;
  order: 'asc' | 'desc';
  icon: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent,RouterLink],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit, OnDestroy, OnChanges {

  // ── Data ─────────────────────────────────────────────
  products: IProduct[] = [];
  loading  = true;
  error    = '';

  // ── Pagination ────────────────────────────────────────
  currentPage = 1;
  totalPages  = 1;
  totalResult = 0;
  readonly limit = 6;

  // ── Nav / Flyout ──────────────────────────────────────
  navOpen      = false;
  aiFlyoutOpen = false;
  aiFlyoutTop  = '0px';
  aiFlyoutLeft = '0px';

  private _hideTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Sort ──────────────────────────────────────────────
  sortOptions: SortOption[] = [
    { label: 'Relevance',          value: 'createdAt', order: 'desc', icon: 'adjust'        },
    { label: 'Price: Low to High', value: 'price',     order: 'asc',  icon: 'arrow_upward'  },
    { label: 'Price: High to Low', value: 'price',     order: 'desc', icon: 'arrow_downward' },
  ];
  selectedSort: SortOption = this.sortOptions[0];
  sortOpen = false;

  // ── Filters ───────────────────────────────────────────
  categories       = ['Grains & Seeds', 'Fertilizers', 'Tools & Equipment', 'Organic Produce'];
  selectedCategory = 'Grains & Seeds';

  priceMax      = 1000;
  selectedPrice = 500;
  locationQuery = '';

  ratings        = [4, 3];
  selectedRating = 4;

  // ── Debounce subjects ─────────────────────────────────
  // Price slider fires on every pixel → debounce 400ms before hitting the API
  private _priceSubject    = new Subject<number>();
  // Location input fires on every keystroke → debounce 500ms
  private _locationSubject = new Subject<string>();
  private _subs: Subscription[] = [];

  constructor(private marketService: MarketService) {}

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    // Price debounce
    this._subs.push(
      this._priceSubject.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(val => {
        this.selectedPrice = val;
        this.currentPage   = 1;
        this.loadProducts();
      })
    );

    // Location debounce
    this._subs.push(
      this._locationSubject.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(val => {
        this.locationQuery = val;
        this.currentPage   = 1;
        this.loadProducts();
      })
    );

    this.loadProducts();
  }

  @Input() filters: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.currentPage = 1;
      this.loadProducts();
    }
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
    if (this._hideTimer) clearTimeout(this._hideTimer);
  }

  // ── API call ──────────────────────────────────────────
  loadProducts(): void {
    this.loading = true;
    this.error   = '';

    // Only send non-empty/non-default params so backend ignores missing ones
    const params: Record<string, any> = {
      page:  this.currentPage,
      limit: this.limit,
      sortBy: this.selectedSort.value,
      order:  this.selectedSort.order,
    };

    if (this.selectedCategory)         params['category'] = this.selectedCategory;
    if (this.selectedPrice < this.priceMax) params['maxPrice'] = this.selectedPrice;
    if (this.selectedRating)            params['rating']   = this.selectedRating;
    if (this.locationQuery.trim())      params['location'] = this.locationQuery.trim();

    this.marketService.getAllProducts(params).subscribe({
      next: (res: any) => {
        // Support paginatedResult middleware shape OR plain array
        const data       = res.result ?? res.data ?? res;
        this.products    = Array.isArray(data) ? data : [];
        this.totalPages  = res.totalPages  ?? res.pages       ?? 1;
        this.currentPage = res.page        ?? res.currentPage ?? this.currentPage;
        this.totalResult = res.totalResult ?? res.total       ?? this.products.length;
        this.loading     = false;
      },
      error: (err: any) => {
        this.error   = 'Failed to load products.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // ── Sort ──────────────────────────────────────────────
  selectSort(opt: SortOption): void {
    this.selectedSort = opt;
    this.sortOpen     = false;
    this.currentPage  = 1;
    this.loadProducts();
  }

  toggleSort(): void {
    this.sortOpen = !this.sortOpen;
  }

  // ── Filter actions ────────────────────────────────────

  /** Category chip → immediate reload */
  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.currentPage      = 1;
    this.loadProducts();
  }

  /** Price slider moves → update display instantly, debounce the API call */
  onPriceChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.selectedPrice = val;          // update UI immediately
    this._priceSubject.next(val);      // debounced API call
  }

  /** Location input → debounced API call */
  onLocationChange(val: string): void {
    this.locationQuery = val;          // keep ngModel in sync
    this._locationSubject.next(val);
  }

  /** Rating click → immediate reload */
  selectRating(r: number): void {
    this.selectedRating = r;
    this.currentPage    = 1;
    this.loadProducts();
  }

  /** Clear all → reset state and reload */
  clearFilters(): void {
    this.selectedCategory = this.categories[0];
    this.selectedPrice    = 500;
    this.locationQuery    = '';
    this.selectedRating   = 4;
    this.selectedSort     = this.sortOptions[0];
    this.currentPage      = 1;
    this.loadProducts();
  }

  // ── Pagination ────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  get visiblePages(): number[] {
    const delta = 1;
    const range: number[] = [];
    const result: number[] = [];
    let l: number | undefined;

    for (let i = 1; i <= this.totalPages; i++) {
      if (
        i === 1 || i === this.totalPages ||
        (i >= this.currentPage - delta && i <= this.currentPage + delta)
      ) range.push(i);
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2)      result.push(l + 1);
        else if (i - l !== 1) result.push(-1); // -1 = ellipsis dots
      }
      result.push(i);
      l = i;
    }

    return result;
  }

  // ── AI Flyout ─────────────────────────────────────────
  showAiFlyout(el: HTMLElement): void {
    if (this._hideTimer) { clearTimeout(this._hideTimer); this._hideTimer = null; }
    const rect        = el.getBoundingClientRect();
    this.aiFlyoutTop  = rect.top  + 'px';
    this.aiFlyoutLeft = (rect.right + 10) + 'px';
    this.aiFlyoutOpen = true;
  }

  keepAiFlyout(): void {
    if (this._hideTimer) { clearTimeout(this._hideTimer); this._hideTimer = null; }
  }

  scheduleHideAiFlyout(): void {
    this._hideTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  }

  // ── Helpers ───────────────────────────────────────────
  getStarFill(s: number, r: number): string {
    return s <= r ? "'FILL' 1" : "'FILL' 0";
  }

  get pricePct(): number {
    return (this.selectedPrice / this.priceMax) * 100;
  }
}
