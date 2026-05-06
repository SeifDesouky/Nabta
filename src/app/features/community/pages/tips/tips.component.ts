import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ExpertTipService, TipCategory } from '../../../../core/services/tips/tips.service';
import { ExpertTip, CreateTipRequest } from '../../../../core/models/tips&tricks.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RouterLink } from '@angular/router';
import { INotification } from '../../../../core/models/notifications.model';
import { NotificationService } from '../../../../core/services/notification/notification.service';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './tips.component.html',
  styleUrl: './tips.component.css'
})
export class TipsComponent {
notifications: INotification[] = [];
    notifOpen: boolean = false;
    notifLoading: boolean = false;
    unreadCount: number = 0;
    sortOpen: boolean = false;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── Compose Form ──────────────────────────────────
  tipTitle        = '';
  tipContent      = '';
  tipCropName     = '';
  tipSeason       = '';
  selectedCategory: TipCategory = 'Soil Health';
  submitting      = false;
  charCount       = 0;
  readonly MAX_CHARS = 280;

  // ── Search ────────────────────────────────────────
  searchQuery = '';

  // ── AI Flyout (للـ sidebar) ────────────────────────
  aiFlyoutOpen = false;
  aiFlyoutTop  = '0px';
  aiFlyoutLeft = '0px';
  private _hideTimer: any;

  // ── Tips Flyout (sub-menu في الـ sidebar) ─────────
  tipsFlyoutOpen = false;
  tipsFlyoutTop  = '0px';
  tipsFlyoutLeft = '0px';
  private _tipsHideTimer: any;

  constructor(readonly tipService: ExpertTipService,readonly authService:AuthService,private notifService:NotificationService ,
    private eRef: ElementRef) {}

  ngOnInit(): void {
    this.tipService.loadAllTips();

    // Debounce search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => this.tipService.setSearch(q));
        this.loadUnreadCount();

  }

  // ── Computed ──────────────────────────────────────
  get filteredTips(): ExpertTip[] {
    return this.tipService.filteredTips;
  }

  get totalCount(): number {
    return this.tipService.total;
  }

  // ── Compose ───────────────────────────────────────
  onContentInput(): void {
    this.charCount = this.tipContent.length;
  }

  selectCategory(cat: TipCategory): void {
    this.selectedCategory = cat;
  }

  submitTip(): void {
    if (!this.tipContent.trim() || this.charCount > this.MAX_CHARS || this.submitting) return;
    this.submitting = true;

    const payload: CreateTipRequest = {
      title:    this.tipTitle.trim() || this.tipContent.slice(0, 60),
      content:  this.tipContent.trim(),
      cropName: this.tipCropName.trim() || undefined,
      season:   this.tipSeason.trim()   || undefined,
    };

    this.tipService.createTip(payload).subscribe({
      next: () => {
        this.tipContent  = '';
        this.tipTitle    = '';
        this.tipCropName = '';
        this.tipSeason   = '';
        this.charCount   = 0;
        this.submitting  = false;
      },
      error: () => { this.submitting = false; }
    });
  }

  // ── Filter ────────────────────────────────────────
  setFilter(cat: TipCategory): void {
    this.tipService.setFilter(cat);
  }

  isActiveFilter(cat: TipCategory): boolean {
    return this.tipService.activeFilter === cat;
  }

  // ── Search ────────────────────────────────────────
  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  // ── AI Flyout ─────────────────────────────────────
  showAiFlyout(el: HTMLElement): void {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    const rect        = el.getBoundingClientRect();
    this.aiFlyoutTop  = rect.top  + 'px';
    this.aiFlyoutLeft = (rect.right + 10) + 'px';
    this.aiFlyoutOpen = true;
  }

  keepAiFlyout(): void {
    if (this._hideTimer) clearTimeout(this._hideTimer);
  }

  scheduleHideAiFlyout(): void {
    this._hideTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  }

  // ── Tips Sub-menu Flyout (مثل AI flyout) ──────────
  showTipsFlyout(el: HTMLElement): void {
    if (this._tipsHideTimer) clearTimeout(this._tipsHideTimer);
    const rect           = el.getBoundingClientRect();
    this.tipsFlyoutTop   = rect.top  + 'px';
    this.tipsFlyoutLeft  = (rect.right + 10) + 'px';
    this.tipsFlyoutOpen  = true;
  }

  keepTipsFlyout(): void {
    if (this._tipsHideTimer) clearTimeout(this._tipsHideTimer);
  }

  scheduleHideTipsFlyout(): void {
    this._tipsHideTimer = setTimeout(() => { this.tipsFlyoutOpen = false; }, 130);
  }

  // ── Helpers ───────────────────────────────────────
  timeAgo(date: string): string   { return this.tipService.timeAgo(date); }
  getInitials(name: string): string { return this.tipService.getInitials(name); }
  getPillClass(category: string): string { return this.tipService.getCategoryPillClass(category); }
  getCount(cat: TipCategory): number { return this.tipService.getCountByCategory(cat); }

  get isOverLimit(): boolean { return this.charCount > this.MAX_CHARS; }

  readonly filterTabs: { label: string; value: TipCategory }[] = [
    { label: 'All',           value: 'all'           },
    { label: 'Soil Health',   value: 'Soil Health'   },
    { label: 'Irrigation',    value: 'Irrigation'    },
    { label: 'Pest Control',  value: 'Pest Control'  },
    { label: 'Crop Rotation', value: 'Crop Rotation' },
  ];

  readonly composeCategories: TipCategory[] = [
    'Soil Health', 'Irrigation', 'Pest Control',
    'Crop Rotation', 'Market Success', 'AI Tools'
  ];

  readonly seasons = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-round'];

    @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notifOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.notifOpen = false;
    }
    if (this.sortOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.sortOpen = false;
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

  ngOnDestroy(): void {
    this._hideTimer && clearTimeout(this._hideTimer);
    this._tipsHideTimer && clearTimeout(this._tipsHideTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }
   logout():void{
    this.authService.logout()
  }
}
