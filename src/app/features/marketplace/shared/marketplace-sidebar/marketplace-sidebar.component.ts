import { Component, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth/auth.service';

export interface MarketFilters {
  category: string;
  price: number;
  location: string;
  rating: number;
}

interface NavItem {
  label: string;
  route: string;
  icon: string;
  filled?: boolean;
  isAiTrigger?: boolean;
}

interface AiTool {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-marketplace-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './marketplace-sidebar.component.html',
  styleUrl: './marketplace-sidebar.component.css'
})
export class MarketplaceSidebarComponent implements OnInit, OnDestroy {
  @Output() filtersChanged = new EventEmitter<MarketFilters>();

  private authService = inject(AuthService);

  // ── Role ──
  get role(): string {
    return this.authService.getUserRole() ?? 'guest';
  }

  // ── Nav Items per Role ──
// ── Nav Items per Role ──
get navItems(): NavItem[] {
  const byRole: Record<string, NavItem[]> = {
    farmer: [
      { label: 'Dashboard',   route: '/farmer',          icon: 'dashboard' },
      { label: 'Marketplace', route: '/marketplace',     icon: 'storefront', filled: true },
      { label: 'Community',   route: '/community',       icon: 'groups' },
      { label: 'AI Tools',    route: '',                 icon: 'psychology', isAiTrigger: true },
      { label: 'Chats',       route: '/chats',           icon: 'chat' },
    ],
    buyer: [
      { label: 'Dashboard',   route: '/buyer/dashboard', icon: 'dashboard' },
      { label: 'Marketplace', route: '/marketplace',     icon: 'storefront', filled: true },
      { label: 'My Orders',   route: '/buyer/orders',    icon: 'receipt_long' },
      { label: 'Wishlist',    route: '/buyer/wishlist',  icon: 'favorite' },
      { label: 'Chats',       route: '/chats',           icon: 'chat' },
    ],
    expert: [
      { label: 'Dashboard',      route: '/expert',                icon: 'dashboard' },
      { label: 'Marketplace',    route: '/marketplace',           icon: 'storefront', filled: true },
      { label: 'Community',      route: '/community',             icon: 'groups' },
      { label: 'Consultations',  route: '/expert/consultations',  icon: 'medical_services' },
      { label: 'Chats',          route: '/chats',                 icon: 'chat' },
    ],
    admin: [
      { label: 'Users',       route: '/admin/users',     icon: 'manage_accounts' },
      { label: 'Marketplace', route: '/marketplace',     icon: 'storefront', filled: true },
      { label: 'Reports',     route: '/admin/reports',   icon: 'bar_chart' },
    ],
    guest: [
      { label: 'Marketplace', route: '/marketplace',     icon: 'storefront', filled: true },
      { label: 'Educational', route: '/educational',     icon: 'school' },
    ],
  };

  return byRole[this.role] ?? byRole['guest'];
}

  // ── AI Tools (farmer فقط) ──
  get showAiTools(): boolean {
    return this.role === 'farmer';
  }

  aiTools: AiTool[] = [
    { label: 'ChatBot',        icon: 'smart_toy', route: '/ai/chatbot'   },
    { label: 'Crop Diagnosis', icon: 'yard',      route: '/ai/diagnosis' },
  ];

  // ── Filters (مش للـ admin) ──
  get showFilters(): boolean {
    return this.role !== 'admin';
  }

  // ── Filters State ──
  categories = ['Grains & Seeds', 'Fertilizers', 'Tools & Equipment', 'Organic Produce'];
  selectedCategory = 'Grains & Seeds';
  priceMax = 1000;
  selectedPrice = 500;
  locationQuery = '';
  ratings = [4, 3];
  selectedRating = 4;

  // ── Debounce ──
  private priceSubject    = new Subject<number>();
  private locationSubject = new Subject<string>();
  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.priceSubject.pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(val => { this.selectedPrice = val; this.emitFilters(); })
    );
    this.subs.push(
      this.locationSubject.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(val => { this.locationQuery = val; this.emitFilters(); })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this._aiTimer) clearTimeout(this._aiTimer);
  }

  private emitFilters(): void {
    this.filtersChanged.emit({
      category: this.selectedCategory,
      price:    this.selectedPrice,
      location: this.locationQuery,
      rating:   this.selectedRating,
    });
  }

  selectCategory(cat: string): void { this.selectedCategory = cat; this.emitFilters(); }

  onPriceChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.selectedPrice = val;
    this.priceSubject.next(val);
  }

  onLocationChange(val: string): void {
    this.locationQuery = val;
    this.locationSubject.next(val);
  }

  selectRating(r: number): void { this.selectedRating = r; this.emitFilters(); }

  clearFilters(): void {
    this.selectedCategory = this.categories[0];
    this.selectedPrice    = 500;
    this.locationQuery    = '';
    this.selectedRating   = 4;
    this.emitFilters();
  }

  get pricePct(): number { return (this.selectedPrice / this.priceMax) * 100; }

  getStarFill(s: number, r: number): string { return s <= r ? "'FILL' 1" : "'FILL' 0"; }

  // ── AI Flyout ──
  aiFlyoutOpen = false;
  aiFlyoutTop  = '0px';
  aiFlyoutLeft = '0px';
  private _aiTimer: any;

  showAiFlyout(el: HTMLElement): void {
    if (this._aiTimer) clearTimeout(this._aiTimer);
    const rect = el.getBoundingClientRect();
    this.aiFlyoutTop  = rect.top + 'px';
    this.aiFlyoutLeft = (rect.right + 10) + 'px';
    this.aiFlyoutOpen = true;
  }

  keepAiFlyout(): void { if (this._aiTimer) clearTimeout(this._aiTimer); }

  scheduleHideAiFlyout(): void {
    this._aiTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  }
}