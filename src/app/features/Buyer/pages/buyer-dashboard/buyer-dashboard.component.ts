import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BuyerDashboardService } from '../../../../core/services/buyer/buyer-dashboard/buyer-dashboard.service';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private readonly router   = inject(Router);
  readonly svc = inject(BuyerDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── Filter State ──────────────────────────────────────────────────────────
  searchQuery      = '';
  selectedCategory = 'All';
  categories       = ['All', 'Grains & Seeds', 'Fertilizers', 'Tools & Equipment', 'Organic Produce'];

  // ── Computed Stats ────────────────────────────────────────────────────────
  orderStats: ReturnType<BuyerDashboardService['getOrderStats']> | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.svc.loadDashboard();
    this.svc.loadMyOrders();
    this.svc.loadProducts();

    const streams: Observable<any>[] = [
      this.svc.user$, this.svc.profile$, this.svc.loading$,
      this.svc.myOrders$, this.svc.ordersLoading$,
      this.svc.products$, this.svc.productsLoading$,
    ];

    streams.forEach(obs =>
      obs.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck())
    );

    // Recompute stats whenever orders change
    this.svc.myOrders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.orderStats = this.svc.getOrderStats(orders);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goToMarketplace():  void { this.router.navigate(['/marketplace']); }
  goToCommunity():    void { this.router.navigate(['/community']); }
  goToEducational():  void { this.router.navigate(['/educational']); }

  scrollToOrders(): void {
    setTimeout(() => {
      document.getElementById('orders-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ── Products ──────────────────────────────────────────────────────────────
  onSearch(query: string): void {
    const cat = this.selectedCategory === 'All' ? undefined : this.selectedCategory;
    this.svc.loadProducts({ search: query || undefined, category: cat });
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    const category = cat === 'All' ? undefined : cat;
    this.svc.loadProducts({ category, search: this.searchQuery || undefined });
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  cancelOrder(orderId: string): void {
    this.svc.cancelOrder(orderId).subscribe();
  }
}