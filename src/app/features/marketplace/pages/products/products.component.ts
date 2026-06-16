import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { IProduct } from '../../../../core/models/product.model';
import { MarketService } from '../../../../core/services/market/market.service';
import { Router, RouterLink } from '@angular/router';
import { INotification } from '../../../../core/models/notifications.model';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { FarmerProfileService } from '../../../../core/services/farmer/farmer-profile/farmer-profile.service';
import { CartService } from '../../../../core/services/cart/cart.service';
import { CartItem } from '../../../../core/models/cart.model';
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
   currentUserRole: string = localStorage.getItem('role') || 'farmer';
 currentUserName: string = '';
currentUserEmail: string = '';
currentUserAvatar: string = '';

  get dashboardLink(): string {
    return this.currentUserRole === 'expert' ? '/expert/dashboard' : '/farmer/dashboard';
  }
 
  // ── Products ──────────────────────────────────────────
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
 
  communityFlyoutOpen = false;
  communityFlyoutTop  = '0px';
  communityFlyoutLeft = '0px';
  private _communityTimer: any;
 
  // ── Notifications ─────────────────────────────────────
  notifications: INotification[] = [];
  unreadCount   = 0;
  notifOpen     = false;
  notifLoading  = false;
 
  // ── Sort ──────────────────────────────────────────────
  sortOptions: SortOption[] = [
    { label: 'Relevance',          value: 'createdAt', order: 'desc', icon: 'adjust'         },
    { label: 'Price: Low to High', value: 'price',     order: 'asc',  icon: 'arrow_upward'   },
    { label: 'Price: High to Low', value: 'price',     order: 'desc', icon: 'arrow_downward'  },
  ];
  selectedSort: SortOption = this.sortOptions[0];
  sortOpen = false;
 // ── Cart Dropdown ──────────────────────────────────────
cartOpen    = false;
cartLoading = false;
cartItems: CartItem[] = [];
  // ── Filters ───────────────────────────────────────────
  // categories       = ['Grains & Seeds', 'Fertilizers', 'Tools & Equipment', 'Organic Produce'];
  // selectedCategory = 'Grains & Seeds';
  // غير الـ initial value
categories: string[]    = [];
selectedCategory        = '';   // ← هيتحدد بعد ما يجي من الباك
selectedRating          = 0;    // ← 0 = no filter (بدل 4)
  searchQuery      = '';
  priceMax      = 1000;
  selectedPrice = 500;
  locationQuery = '';
 
  ratings        = [4, 3];
 
  // ── Debounce subjects ─────────────────────────────────
  private _priceSubject    = new Subject<number>();
  private _searchSubject   = new Subject<string>();
  private _locationSubject = new Subject<string>();
  private _subs: Subscription[] = [];
 
  constructor(
    private marketService: MarketService,
    private notifService:NotificationService ,
    private eRef: ElementRef,
    private router: Router,
     private farmerProfileService: FarmerProfileService ,
     private cartService: CartService
  ) {}
 
// ── Role-based Nav ──
get navItems() {
  const byRole: Record<string, any[]> = {
    farmer: [
      { label: 'Dashboard',   route: '/farmer',          icon: 'dashboard',   filled: false },
      { label: 'Marketplace', route: '/marketplace',     icon: 'storefront',  filled: true,  isMarket: true },
      { label: 'Educational', route: '/educational',     icon: 'school',      filled: false },
      { label: 'Community',   route: '/community',       icon: 'groups',      filled: false, isCommunity: true },
      { label: 'AI Tools',    route: '',                 icon: 'psychology',  filled: false, isAiTrigger: true },
      { label: 'Chats',       route: '/chats',           icon: 'chat',        filled: false },
    ],
    buyer: [
      { label: 'Dashboard',   route: '/buyer/dashboard', icon: 'dashboard',   filled: false },
      { label: 'Marketplace', route: '/marketplace',     icon: 'storefront',  filled: true,  isMarket: true },
      { label: 'My Orders',   route: '/buyer/orders',    icon: 'receipt_long',filled: false },
      { label: 'Wishlist',    route: '/buyer/wishlist',  icon: 'favorite',    filled: false },
      { label: 'Chats',       route: '/chats',           icon: 'chat',        filled: false },
    ],
    expert: [
      { label: 'Dashboard',     route: '/expert',                 icon: 'dashboard',        filled: false },
      { label: 'Marketplace',   route: '/marketplace',            icon: 'storefront',       filled: true,  isMarket: true },
      { label: 'Community',     route: '/community',              icon: 'groups',           filled: false, isCommunity: true },
      { label: 'Consultations', route: '/expert/consultations',   icon: 'medical_services', filled: false },
      { label: 'Chats',         route: '/chats',                  icon: 'chat',             filled: false },
    ],
    admin: [
      { label: 'Users',       route: '/admin/users',    icon: 'manage_accounts', filled: false },
      { label: 'Marketplace', route: '/marketplace',    icon: 'storefront',      filled: true, isMarket: true },
      { label: 'Reports',     route: '/admin/reports',  icon: 'bar_chart',       filled: false },
    ],
  };

  return byRole[this.currentUserRole] ?? byRole['farmer'];
}

get showFilters(): boolean {
  return this.currentUserRole !== 'admin';
}

get showAiTools(): boolean {
  return this.currentUserRole === 'farmer';
}

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
  this.currentUserName  = localStorage.getItem('name')   || 'User';
  this.currentUserEmail = localStorage.getItem('email')  || '';
  this.currentUserAvatar = localStorage.getItem('avatar') || '';
  this.farmerProfileService.loadProfile();
  
  this._subs.push(
    this.farmerProfileService.user$.subscribe(user => {
      if (user) {
        this.currentUserName   = user.name  ?? '';
        this.currentUserEmail  = user.email ?? '';
        this.currentUserAvatar = user.avatar ?? user.profileImage ?? '';
      }
    })
  );
    // Search debounce
    this._subs.push(
      this._searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(val => {
        this.searchQuery = val;
        this.currentPage = 1;
        this.loadProducts();
      })
    );
    // Price debounce
    this._subs.push(
      this._priceSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(val => {
        this.selectedPrice = val;
        this.currentPage   = 1;
        this.loadProducts();
      })
    );
    // Location debounce
    this._subs.push(
      this._locationSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(val => {
        this.locationQuery = val;
        this.currentPage   = 1;
        this.loadProducts();
      })
    );

    // load cart count on init
this.cartService.loadCart().subscribe({
  next: (cart) => {
    this.cartItems = cart?.items ?? [];
  },
  error: () => {}
});

// subscribe للـ cart stream عشان الـ badge يتحدث real-time
this._subs.push(
  this.cartService.cart$.subscribe(cart => {
    this.cartItems = cart?.items ?? [];
  })
);
 
    this.loadProducts();
    // في ngOnInit — بعد loadProducts()
this.loadCategories();
    this.loadUnreadCount();
  }
  goToProfile(): void {
  this.router.navigate([`/${this.currentUserRole}/profile`]);
}
 // method جديدة
loadCategories(): void {
  this.marketService.getCategories().subscribe({
    next: (cats) => {
      this.categories = cats;
      // ← مش بنحط selectedCategory هنا خالص
    },
    error: () => {
      this.categories = ['Grains & Seeds', 'Fertilizers', 'Tools & Equipment', 'Organic Produce'];
    }
  });
}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.currentPage = 1;
      this.loadProducts();
    }
  }
 
  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
    if (this._hideTimer) clearTimeout(this._hideTimer);
    if (this._communityTimer) clearTimeout(this._communityTimer);
  }
 
  // ── Click outside → close notification dropdown ───────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notifOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.notifOpen = false;
    }
    if (this.sortOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.sortOpen = false;
    }
    if (this.cartOpen && !this.eRef.nativeElement.contains(event.target)) {
  this.cartOpen = false;
}
  }
 
  // ══════════════════════════════════════════════════════
  //  NOTIFICATION METHODS
  // ══════════════════════════════════════════════════════
 
  /** Fetch unread count on page load (lightweight call) */
  loadUnreadCount(): void {
    this.notifService.getUnreadCount().subscribe({
      next: (count) => (this.unreadCount = count),
      error: (err)  => console.error('Could not fetch unread count', err),
    });
  }
 // ── Cart Dropdown ──────────────────────────────────────
toggleCartDropdown(): void {
  this.cartOpen = !this.cartOpen;
  if (this.cartOpen && this.cartItems.length === 0) {
    this.cartLoading = true;
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cartItems  = cart?.items ?? [];
        this.cartLoading = false;
      },
      error: () => { this.cartLoading = false; }
    });
  }
}

incrementCartItem(item: CartItem): void {
  this.cartService.addItem({ productId: item.productId, quantity: 1 }).subscribe();
}

decrementCartItem(item: CartItem): void {
  this.cartService.removeItem(item.slug).subscribe();
}

get cartItemCount(): number {
  return this.cartItems.length;
}
get cartSubtotal(): number {
  return this.cartService.getSubtotal(this.cartItems);
}
  /** Toggle dropdown — lazy-load notifications list on first open */
  toggleNotifDropdown(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }
 
  /** Fetch all notifications */
  loadNotifications(): void {
    this.notifLoading = true;
    this.notifService.getAll().subscribe({
      next: (list) => {
        this.notifications = list;
        this.notifLoading  = false;
      },
      error: (err) => {
        console.error('Could not fetch notifications', err);
        this.notifLoading = false;
      },
    });
  }
 
  /** Mark one notification as read and update the local state */
  readNotif(n: INotification): void {
    if (n.isRead) return;
    this.notifService.markAsRead(n._id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => console.error('Could not mark as read', err),
    });
  }
 
  /** Icon helpers — map notification type to a Material Symbol */
  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      order:   'shopping_bag',
      payment: 'payments',
      message: 'chat',
      alert:   'warning',
      system:  'info',
    };
    return map[type] ?? 'notifications';
  }
 
  getNotifIconBg(type: string): string {
    const map: Record<string, string> = {
      order:   'bg-blue-50',
      payment: 'bg-emerald-50',
      message: 'bg-violet-50',
      alert:   'bg-amber-50',
      system:  'bg-primary/10',
    };
    return map[type] ?? 'bg-primary/10';
  }
 
  getNotifIconColor(type: string): string {
    const map: Record<string, string> = {
      order:   'text-blue-500',
      payment: 'text-emerald-500',
      message: 'text-violet-500',
      alert:   'text-amber-500',
      system:  'text-primary',
    };
    return map[type] ?? 'text-primary';
  }
 
  // ══════════════════════════════════════════════════════
  //  PRODUCTS / SORT / FILTER / PAGINATION (unchanged)
  // ══════════════════════════════════════════════════════
 
  loadProducts(): void {
    this.loading = true;
    this.error   = '';
 
    const params: Record<string, any> = {
      page:   this.currentPage,
      limit:  this.limit,
      sortBy: this.selectedSort.value,
      order:  this.selectedSort.order,
    };
 
    if (this.searchQuery.trim())            params['search']   = this.searchQuery.trim();
    if (this.selectedCategory)              params['category'] = this.selectedCategory;
    if (this.selectedPrice < this.priceMax) params['maxPrice'] = this.selectedPrice;
    if (this.selectedRating > 0) params['rating'] = this.selectedRating;
    if (this.locationQuery.trim())         params['location'] = this.locationQuery.trim();
 
    this.marketService.getAllProducts(params).subscribe({
      next: (res: any) => {
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
      },
    });
  }
 
  onSearchChange(val: string): void {
    this.searchQuery = val;
    this._searchSubject.next(val);
  }
 
  selectSort(opt: SortOption): void {
    this.selectedSort = opt;
    this.sortOpen     = false;
    this.currentPage  = 1;
    this.loadProducts();
  }
 
  toggleSort(): void { this.sortOpen = !this.sortOpen; }
 
  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.currentPage      = 1;
    this.loadProducts();
  }
 
  onPriceChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.selectedPrice = val;
    this._priceSubject.next(val);
  }
 
  onLocationChange(val: string): void {
    this.locationQuery = val;
    this._locationSubject.next(val);
  }
 
  selectRating(r: number): void {
    this.selectedRating = r;
    this.currentPage    = 1;
    this.loadProducts();
  }
 
clearFilters(): void {
  this.selectedCategory = '';   // ← empty = no filter
  this.selectedPrice    = this.priceMax;
  this.locationQuery    = '';
  this.selectedRating   = 0;
  this.searchQuery      = '';
  this.selectedSort     = this.sortOptions[0];
  this.currentPage      = 1;
  this.loadProducts();
}
 
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
      if (i === 1 || i === this.totalPages ||
        (i >= this.currentPage - delta && i <= this.currentPage + delta))
        range.push(i);
    }
 
    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2)      result.push(l + 1);
        else if (i - l !== 1) result.push(-1);
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
  keepAiFlyout(): void { if (this._hideTimer) { clearTimeout(this._hideTimer); this._hideTimer = null; } }
  scheduleHideAiFlyout(): void { this._hideTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130); }
 
  // ── Community Flyout ──────────────────────────────────
  showCommunityFlyout(el: HTMLElement): void {
    if (this._communityTimer) clearTimeout(this._communityTimer);
    const rect               = el.getBoundingClientRect();
    this.communityFlyoutTop  = rect.top  + 'px';
    this.communityFlyoutLeft = (rect.right + 10) + 'px';
    this.communityFlyoutOpen = true;
  }
  keepCommunityFlyout(): void { if (this._communityTimer) clearTimeout(this._communityTimer); }
  scheduleHideCommunityFlyout(): void { this._communityTimer = setTimeout(() => { this.communityFlyoutOpen = false; }, 130); }
 
  // ── Helpers ───────────────────────────────────────────
  getStarFill(s: number, r: number): string { return s <= r ? "'FILL' 1" : "'FILL' 0"; }
  get pricePct(): number { return (this.selectedPrice / this.priceMax) * 100; }

}
