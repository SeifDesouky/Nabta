import {
  Component, ChangeDetectionStrategy, inject,
  ChangeDetectorRef, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FarmerDashboardService } from '../../../../core/services/farmer/farmer-dashboard/farmer-dashboard.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-farmer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farmer-sidebar.component.html',
  styleUrl: './farmer-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmerSidebarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly svc              = inject(FarmerDashboardService);
  private readonly cdr      = inject(ChangeDetectorRef);
  private readonly auth     = inject(AuthService);
  private readonly router   = inject(Router);

  // ── Role ──────────────────────────────────────────────────────────────────
  get role(): string {
    return this.auth.getUserRole() ?? 'guest';
  }

  // ── Dashboard link حسب الرول ──────────────────────────────────────────────
  get dashboardLink(): string {
    const map: Record<string, string> = {
      farmer: '/farmer',
      expert: '/expert',
      buyer:  '/buyer/dashboard',
      admin:  '/admin/users',
    };
    return map[this.role] ?? '/';
  }

  // ── Nav Items حسب الرول ───────────────────────────────────────────────────
  get showCommunity(): boolean {
    return ['farmer', 'expert'].includes(this.role);
  }

  get showAiTools(): boolean {
    return this.role === 'farmer';
  }

  get showMarketplace(): boolean {
    return ['farmer', 'buyer', 'expert'].includes(this.role);
  }

  get showMyProducts(): boolean {
    return this.role === 'farmer';
  }

  get showConsultations(): boolean {
    return this.role === 'expert';
  }

  get showMyOrders(): boolean {
    return this.role === 'buyer';
  }

  get showWishlist(): boolean {
    return this.role === 'buyer';
  }

  get showAdminPanel(): boolean {
    return this.role === 'admin';
  }

  get showEducational(): boolean {
    return ['farmer', 'buyer', 'expert', 'guest'].includes(this.role);
  }

  // ── Profile link حسب الرول ───────────────────────────────────────────────
  get profileLink(): string {
    const map: Record<string, string> = {
      farmer: '/farmer/profile',
      expert: '/expert/profile',
      buyer:  '/buyer/profile',
      admin:  '/admin/profile',
    };
    return map[this.role] ?? '/';
  }

  // ── Flyout State ──────────────────────────────────────────────────────────
  navOpen = true;

  aiFlyoutOpen  = false;
  aiFlyoutTop   = '0px';
  aiFlyoutLeft  = '0px';
  private _aiTimer: any;

  communityFlyoutOpen  = false;
  communityFlyoutTop   = '0px';
  communityFlyoutLeft  = '0px';
  private _communityTimer: any;

  marketFlyoutOpen  = false;
  marketFlyoutTop   = '0px';
  marketFlyoutLeft  = '0px';
  private _marketTimer: any;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.svc.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this._aiTimer);
    clearTimeout(this._communityTimer);
    clearTimeout(this._marketTimer);
  }

  // ── AI Flyout ─────────────────────────────────────────────────────────────
  showAiFlyout(el: HTMLElement): void {
    clearTimeout(this._aiTimer);
    const r = el.getBoundingClientRect();
    this.aiFlyoutTop  = r.top + 'px';
    this.aiFlyoutLeft = (r.right + 10) + 'px';
    this.aiFlyoutOpen = true;
  }
  keepAiFlyout(): void { clearTimeout(this._aiTimer); }
  scheduleHideAiFlyout(): void {
    this._aiTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  }

  // ── Community Flyout ──────────────────────────────────────────────────────
  showCommunityFlyout(el: HTMLElement): void {
    clearTimeout(this._communityTimer);
    const r = el.getBoundingClientRect();
    this.communityFlyoutTop  = r.top + 'px';
    this.communityFlyoutLeft = (r.right + 10) + 'px';
    this.communityFlyoutOpen = true;
  }
  keepCommunityFlyout(): void { clearTimeout(this._communityTimer); }
  scheduleHideCommunityFlyout(): void {
    this._communityTimer = setTimeout(() => { this.communityFlyoutOpen = false; }, 130);
  }

  // ── Marketplace Flyout ────────────────────────────────────────────────────
  showMarketFlyout(el: HTMLElement): void {
    clearTimeout(this._marketTimer);
    const r = el.getBoundingClientRect();
    this.marketFlyoutTop  = r.top + 'px';
    this.marketFlyoutLeft = (r.right + 10) + 'px';
    this.marketFlyoutOpen = true;
  }
  keepMarketFlyout(): void { clearTimeout(this._marketTimer); }
  scheduleHideMarketFlyout(): void {
    this._marketTimer = setTimeout(() => { this.marketFlyoutOpen = false; }, 130);
  }

  // ── Active State Helpers ──────────────────────────────────────────────────
  isCommunityActive():  boolean { return this.router.url.startsWith('/community'); }
  isAiActive():         boolean { return this.router.url.startsWith('/ai'); }
  isMarketplaceActive():boolean { return this.router.url.startsWith('/marketplace'); }

  // ── Auth ──────────────────────────────────────────────────────────────────
  logout(): void { this.auth.logout(); }
}