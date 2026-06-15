import {
  Component, ChangeDetectionStrategy, inject,
  ChangeDetectorRef, OnInit, OnDestroy, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FarmerDashboardService } from '../../../../core/services/farmer/farmer-dashboard/farmer-dashboard.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
 
export interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  filled?: boolean;
}

@Component({
  selector: 'app-farmer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farmer-sidebar.component.html',
  styleUrl: './farmer-sidebar.component.css'
})
export class FarmerSidebarComponent {
  private readonly destroy$ = new Subject<void>();
  readonly svc = inject(FarmerDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);
  currentUserRole: string = localStorage.getItem('role') || 'farmer'; 

  get dashboardLink(): string {
    return this.currentUserRole === 'expert' ? '/expert/dashboard' : '/farmer/dashboard';
  }


  // AI Flyout
  aiFlyoutOpen = false;
  aiFlyoutTop  = '0px';
  aiFlyoutLeft = '0px';
  private _hideTimer: any;

  // Nav
  navOpen = true;
topContributors = [
  { name: 'Sarah Jensen',    role: 'Agronomist'     },
  { name: 'Marcus Chen',     role: 'Soil Specialist' },
  { name: 'Elena Rodriguez', role: 'Data Scientist'  },
];

showAiFlyout(el: HTMLElement): void {
  if (this._hideTimer) clearTimeout(this._hideTimer);
  const rect = el.getBoundingClientRect();
  this.aiFlyoutTop  = rect.top + 'px';
  this.aiFlyoutLeft = (rect.right + 10) + 'px';
  this.aiFlyoutOpen = true;
}

  keepAiFlyout(): void {
    if (this._hideTimer) clearTimeout(this._hideTimer);
  }

  scheduleHideAiFlyout(): void {
    this._hideTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  }

// Community Flyout
communityFlyoutOpen = false;
communityFlyoutTop  = '0px';
communityFlyoutLeft = '0px';
private _communityTimer: any;

showCommunityFlyout(el: HTMLElement): void {
  if (this._communityTimer) clearTimeout(this._communityTimer);
  const rect = el.getBoundingClientRect();
  this.communityFlyoutTop  = rect.top + 'px';
  this.communityFlyoutLeft = (rect.right + 10) + 'px';
  this.communityFlyoutOpen = true;
}

keepCommunityFlyout(): void {
  if (this._communityTimer) clearTimeout(this._communityTimer);
}

scheduleHideCommunityFlyout(): void {
  this._communityTimer = setTimeout(() => {
    this.communityFlyoutOpen = false;
  }, 130);
}

// Marketplace Flyout
marketFlyoutTop = '0px';
marketFlyoutLeft = '0px';
marketFlyoutOpen = false;
private _marketTimer: any;

showMarketFlyout(el: HTMLElement): void {
  if (this._marketTimer) clearTimeout(this._marketTimer);

  const rect = el.getBoundingClientRect();

  this.marketFlyoutTop = rect.top + 'px';
  this.marketFlyoutLeft = (rect.right + 10) + 'px';

  this.marketFlyoutOpen = true;
}

keepMarketFlyout(): void {
  if (this._marketTimer) clearTimeout(this._marketTimer);
}

scheduleHideMarketFlyout(): void {
  this._marketTimer = setTimeout(() => { this.marketFlyoutOpen = false; }, 130);
}
isCommunityActive(): boolean {
  return this.router.url.startsWith('/community');
}

isAiActive(): boolean {
  return this.router.url.startsWith('/ai');
}

isMarketplaceActive(): boolean {
  return this.router.url.startsWith('/marketplace');
}
  logout():void{
    this.authService.logout()
  }

constructor(private authService:AuthService,private router: Router){}

  ngOnInit(): void {
    this.svc.unreadCount$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }
 
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
 

}
