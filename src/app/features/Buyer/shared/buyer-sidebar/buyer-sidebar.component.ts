import {
  Component, ChangeDetectionStrategy, inject,
  ChangeDetectorRef, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { BuyerDashboardService } from '../../../../core/services/buyer/buyer-dashboard/buyer-dashboard.service';

@Component({
  selector: 'app-buyer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-sidebar.component.html',
  styleUrl:    './buyer-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerSidebarComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private readonly cdr      = inject(ChangeDetectorRef);
  private readonly router   = inject(Router);
  private readonly auth     = inject(AuthService);
  readonly svc              = inject(BuyerDashboardService);

  // ── Marketplace Flyout ────────────────────────────────────────────────────
  marketFlyoutOpen = false;
  marketFlyoutTop  = '0px';
  marketFlyoutLeft = '0px';
  private _marketTimer: any;

  showMarketFlyout(el: HTMLElement): void {
    if (this._marketTimer) clearTimeout(this._marketTimer);
    const rect = el.getBoundingClientRect();
    this.marketFlyoutTop  = rect.top + 'px';
    this.marketFlyoutLeft = (rect.right + 10) + 'px';
    this.marketFlyoutOpen = true;
  }
  keepMarketFlyout():         void { if (this._marketTimer) clearTimeout(this._marketTimer); }
  scheduleHideMarketFlyout(): void {
    this._marketTimer = setTimeout(() => { this.marketFlyoutOpen = false; }, 130);
  }

  // ── Active checks ─────────────────────────────────────────────────────────
  isMarketplaceActive(): boolean { return this.router.url.startsWith('/marketplace'); }

  // ── Auth ──────────────────────────────────────────────────────────────────
  logout(): void { this.auth.logout(); }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.svc.myOrders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}