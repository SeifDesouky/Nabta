import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Guide, GuideType } from '../../../../core/models/educational.model';
import { GuideService } from '../../../../core/services/educational/educational.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { INotification } from '../../../../core/models/notifications.model';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { FarmerSidebarComponent } from '../../../farmer/shared/farmer-sidebar/farmer-sidebar.component';

@Component({
  selector: 'app-educational',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,FarmerSidebarComponent],
  templateUrl: './educational.component.html',
  styleUrl: './educational.component.css'
})
export class EducationalComponent {
  currentUserRole: string = localStorage.getItem('role') || 'farmer'; 

  get dashboardLink(): string {
    return this.currentUserRole === 'expert' ? '/expert/dashboard' : '/farmer/dashboard';
  }
 notifications: INotification[] = [];
    notifOpen: boolean = false;
    notifLoading: boolean = false;
    unreadCount: number = 0;
    sortOpen: boolean = false;
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



topContributors = [
  { name: 'Sarah Jensen',    role: 'Agronomist'     },
  { name: 'Marcus Chen',     role: 'Soil Specialist' },
  { name: 'Elena Rodriguez', role: 'Data Scientist'  },
];


  constructor(
    readonly guideService: GuideService,
    private router: Router,
    private authService:AuthService,
    private notifService:NotificationService ,
    private eRef: ElementRef
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
        this.loadUnreadCount();

  }
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
  logout():void{
    this.authService.logout()
  }
}
