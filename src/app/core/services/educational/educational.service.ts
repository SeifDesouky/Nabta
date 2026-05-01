import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Guide, GetGuidesResponse, GuideFilters, GuideType } from '../../models/educational.model';

@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly BASE = `${environment.apiUrl}guide`;

  // ── State ─────────────────────────────────────────
  private guidesSubject    = new BehaviorSubject<Guide[]>([]);
  private loadingSubject   = new BehaviorSubject<boolean>(false);
  private totalPagesSubject = new BehaviorSubject<number>(1);
  private totalResultSubject = new BehaviorSubject<number>(0);
  private currentPageSubject = new BehaviorSubject<number>(1);
  private activeFilterSubject = new BehaviorSubject<GuideType | 'all'>('all');

  guides$       = this.guidesSubject.asObservable();
  loading$      = this.loadingSubject.asObservable();
  totalPages$   = this.totalPagesSubject.asObservable();
  totalResult$  = this.totalResultSubject.asObservable();
  currentPage$  = this.currentPageSubject.asObservable();
  activeFilter$ = this.activeFilterSubject.asObservable();

  readonly LIMIT = 10;

  constructor(private http: HttpClient) {}

  // ── Getters ───────────────────────────────────────
  get guides():       Guide[]              { return this.guidesSubject.getValue(); }
  get loading():      boolean              { return this.loadingSubject.getValue(); }
  get totalPages():   number               { return this.totalPagesSubject.getValue(); }
  get totalResult():  number               { return this.totalResultSubject.getValue(); }
  get currentPage():  number               { return this.currentPageSubject.getValue(); }
  get activeFilter(): GuideType | 'all'    { return this.activeFilterSubject.getValue(); }

  // ── API Calls ─────────────────────────────────────

  // GET /guide?type=article&page=1&limit=10
loadGuides(filters: GuideFilters = {}): void {
  this.loadingSubject.next(true);

  let params = new HttpParams()
    .set('page',  filters.page  ?? this.currentPage)
    .set('limit', filters.limit ?? this.LIMIT);

  if (filters.type && filters.type !== 'all' as any) {
    params = params.set('type', filters.type);
  }

  // ← جديد: search param
  if (filters.search?.trim()) {
    params = params.set('search', filters.search.trim());
  }

  this.http.get<GetGuidesResponse>(`${this.BASE}/`, { params }).subscribe({
    next: (res) => {
      console.log(res);
      
      this.guidesSubject.next(res.result ?? []);
      this.totalPagesSubject.next(res.totalPages ?? 1);
      this.totalResultSubject.next(res.totalResult ?? 0);
      this.currentPageSubject.next(res.page ?? 1);
      this.loadingSubject.next(false);
    },
    error: () => this.loadingSubject.next(false)
  });
}

  // ── Filter Actions ────────────────────────────────
  setFilter(type: GuideType | 'all'): void {
    this.activeFilterSubject.next(type);
    this.currentPageSubject.next(1);
    this.loadGuides({ type: type === 'all' ? undefined : type, page: 1 });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPageSubject.next(page);
    this.loadGuides({
      type: this.activeFilter === 'all' ? undefined : this.activeFilter,
      page
    });
  }

  // ── Helpers ───────────────────────────────────────
  getTypeColor(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'text-primary',
      video:    'text-tertiary',
      tutorial: 'text-secondary',
    };
    return map[type] ?? 'text-primary';
  }

  getTypeIcon(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'article',
      video:    'videocam',
      tutorial: 'assignment',
    };
    return map[type] ?? 'article';
  }

  getTypeLabel(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'Article',
      video:    'Video',
      tutorial: 'Tutorial',
    };
    return map[type] ?? type;
  }

  getActionLabel(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'Read Article',
      video:    'Watch Video',
      tutorial: 'Start Tutorial',
    };
    return map[type] ?? 'Open';
  }

  timeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    if (mins  < 60)  return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  < 7)   return `${days}d ago`;
    return `${weeks}w ago`;
  }

  getCountByType(type: GuideType): number {
    return this.guides.filter(g => g.guide_type === type).length;
  }
  // ── أضف الـ method دي جوا GuideService ──────────────────────────────

// GET /guide/:id
getGuideById(id: string): Observable<Guide> {
  return this.http.get<Guide>(`${this.BASE}/${id}`);
}


}
