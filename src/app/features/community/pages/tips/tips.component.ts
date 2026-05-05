import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ExpertTipService, TipCategory } from '../../../../core/services/tips/tips.service';
import { ExpertTip, CreateTipRequest } from '../../../../core/models/tips&tricks.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './tips.component.html',
  styleUrl: './tips.component.css'
})
export class TipsComponent {

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

  constructor(readonly tipService: ExpertTipService,readonly authService:AuthService) {}

  ngOnInit(): void {
    this.tipService.loadAllTips();

    // Debounce search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(q => this.tipService.setSearch(q));
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
