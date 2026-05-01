import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Guide, GuideType } from '../../../../core/models/educational.model';
import { GuideService } from '../../../../core/services/educational/educational.service';

@Component({
  selector: 'app-educational',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './educational.component.html',
  styleUrl: './educational.component.css'
})
export class EducationalComponent {

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  guides:     Guide[]  = [];
  loading     = true;
  searchQuery = '';

  readonly filterTabs: { label: string; value: GuideType | 'all'; icon: string }[] = [
    { label: 'All',       value: 'all',      icon: 'apps'       },
    { label: 'Articles',  value: 'article',  icon: 'article'    },
    { label: 'Videos',    value: 'video',    icon: 'videocam'   },
    { label: 'Tutorials', value: 'tutorial', icon: 'assignment' },
  ];

  constructor(
    readonly guideService: GuideService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.guideService.loadGuides({ page: 1 });

    this.guideService.guides$
      .pipe(takeUntil(this.destroy$))
      .subscribe(guides => this.guides = guides);

    this.guideService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Debounce search - 350ms after user stops typing
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.guideService.loadGuides({
        page: 1,
        type: this.guideService.activeFilter === 'all' ? undefined : this.guideService.activeFilter,
        search: query || undefined
      });
    });
  }

  // ── Search ────────────────────────────────────────
  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  // ── Filtered list (client-side fallback while API responds) ──────────
  get filteredGuides(): Guide[] {
    if (!this.searchQuery.trim()) return this.guides;
    const q = this.searchQuery.toLowerCase();
    return this.guides.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.content.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  // ── Filter ────────────────────────────────────────
  setFilter(type: GuideType | 'all'): void {
    this.guideService.setFilter(type);
  }

  isActiveFilter(type: GuideType | 'all'): boolean {
    return this.guideService.activeFilter === type;
  }

  clearFilter(): void {
    this.guideService.setFilter('all');
  }

  resetAll(): void {
    this.searchQuery = '';
    this.guideService.setFilter('all');
  }

  getActiveFilterLabel(): string {
    const tab = this.filterTabs.find(t => t.value === this.guideService.activeFilter);
    return tab?.label ?? '';
  }

  // ── Pagination ────────────────────────────────────
  get hasPrev(): boolean { return this.guideService.currentPage > 1; }
  get hasNext(): boolean { return this.guideService.currentPage < this.guideService.totalPages; }

  prevPage(): void { this.guideService.goToPage(this.guideService.currentPage - 1); }
  nextPage(): void { this.guideService.goToPage(this.guideService.currentPage + 1); }

  // ── Navigation to detail page ─────────────────────
  openGuide(guide: Guide): void {
    this.router.navigate(['/educational/guide/', guide._id]);
  }

  // ── Counts ────────────────────────────────────────
  getCount(type: GuideType | 'all'): number {
    if (type === 'all') return this.guides.length;
    return this.guideService.getCountByType(type);
  }

  // ── TrackBy ───────────────────────────────────────
  trackByGuide(_: number, guide: Guide): string {
    return guide._id;
  }

  // ── Helpers ───────────────────────────────────────
  getTypeColor(type: GuideType):  string { return this.guideService.getTypeColor(type); }
  getTypeIcon(type: GuideType):   string { return this.guideService.getTypeIcon(type); }
  getTypeLabel(type: GuideType):  string { return this.guideService.getTypeLabel(type); }
  getActionLabel(type: GuideType): string { return this.guideService.getActionLabel(type); }
  timeAgo(date: string): string   { return this.guideService.timeAgo(date); }

  isVideo(guide: Guide): boolean { return guide.guide_type === 'video'; }

  getFirstImage(guide: Guide): string {
    return guide.coverUrl ;
  }

  // Pill color per type
  getTypePillClass(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'bg-blue-500/90 text-white',
      video:    'bg-purple-500/90 text-white',
      tutorial: 'bg-amber-500/90 text-white',
    };
    return map[type] ?? 'bg-primary/90 text-white';
  }

  // Icon inside CTA button
  getTypeActionIcon(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'menu_book',
      video:    'play_circle',
      tutorial: 'school',
    };
    return map[type] ?? 'open_in_new';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
