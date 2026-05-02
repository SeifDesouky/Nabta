import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ExpertTip, GetTipsResponse, CreateTipRequest
} from '../../models/tips&tricks.model'

export type TipCategory = 'all' | 'Soil Health' | 'Irrigation' |
  'Pest Control' | 'Crop Rotation' | 'Market Success' | 'AI Tools';

@Injectable({ providedIn: 'root' })
export class ExpertTipService {
  private readonly BASE = `${environment.apiUrl}tips`;

  // ── State ─────────────────────────────────────────
  private tipsSubject        = new BehaviorSubject<ExpertTip[]>([]);
  private loadingSubject     = new BehaviorSubject<boolean>(false);
  private totalSubject       = new BehaviorSubject<number>(0);
  private activeFilterSubject = new BehaviorSubject<TipCategory>('all');
  private searchQuerySubject  = new BehaviorSubject<string>('');

  tips$         = this.tipsSubject.asObservable();
  loading$      = this.loadingSubject.asObservable();
  total$        = this.totalSubject.asObservable();
  activeFilter$ = this.activeFilterSubject.asObservable();

  readonly categories: TipCategory[] = [
    'all', 'Soil Health', 'Irrigation',
    'Pest Control', 'Crop Rotation', 'Market Success', 'AI Tools'
  ];

  readonly LIMIT = 20;

  constructor(private http: HttpClient) {}

  // ── Getters ───────────────────────────────────────
  get tips():         ExpertTip[]  { return this.tipsSubject.getValue(); }
  get loading():      boolean      { return this.loadingSubject.getValue(); }
  get total():        number       { return this.totalSubject.getValue(); }
  get activeFilter(): TipCategory  { return this.activeFilterSubject.getValue(); }
  get searchQuery():  string       { return this.searchQuerySubject.getValue(); }

  // ── API ───────────────────────────────────────────

  // GET /tips/all_tips?page=1&limit=20
  loadAllTips(): void {
    this.loadingSubject.next(true);
    const params = new HttpParams()
      .set('page', 1)
      .set('limit', this.LIMIT);

    this.http.get<GetTipsResponse>(`${this.BASE}/all_tips`, { params }).subscribe({
      next: (res) => {
        this.tipsSubject.next(res.result ?? []);
        this.totalSubject.next(res.totalResult ?? 0);
        this.loadingSubject.next(false);
      },
      error: () => this.loadingSubject.next(false)
    });
  }

  // POST /tips (expert token)
  createTip(payload: CreateTipRequest): Observable<ExpertTip> {
    return this.http.post<ExpertTip>(`${this.BASE}/`, payload).pipe(
      tap(newTip => {
        // Optimistic add to top
        this.tipsSubject.next([newTip, ...this.tips]);
        this.totalSubject.next(this.total + 1);
      })
    );
  }

  // ── Filter & Search (client-side) ─────────────────
  setFilter(cat: TipCategory): void {
    this.activeFilterSubject.next(cat);
  }

  setSearch(query: string): void {
    this.searchQuerySubject.next(query.toLowerCase().trim());
  }

  // بيرجع الـ tips بعد تطبيق الـ filter والـ search
  get filteredTips(): ExpertTip[] {
    const cat   = this.activeFilter;
    const query = this.searchQuery;

    return this.tips.filter(tip => {
      const matchCat = cat === 'all' ||
        tip.cropName?.toLowerCase().includes(cat.toLowerCase()) ||
        tip.soilType?.some(s => s.toLowerCase().includes(cat.toLowerCase())) ||
        tip.season?.toLowerCase().includes(cat.toLowerCase()) ||
        tip.title.toLowerCase().includes(cat.toLowerCase()) ||
        tip.content.toLowerCase().includes(cat.toLowerCase());

      const matchSearch = !query ||
        tip.title.toLowerCase().includes(query) ||
        tip.content.toLowerCase().includes(query) ||
        tip.cropName?.toLowerCase().includes(query) ||
        tip.expert?.name.toLowerCase().includes(query);

      return matchCat && matchSearch;
    });
  }

  // ── Helpers ───────────────────────────────────────
  getCountByCategory(cat: TipCategory): number {
    if (cat === 'all') return this.tips.length;
    return this.tips.filter(t =>
      t.title.toLowerCase().includes(cat.toLowerCase()) ||
      t.content.toLowerCase().includes(cat.toLowerCase())
    ).length;
  }

  getCategoryPillClass(category: string): string {
    const isPest   = category === 'Pest Control';
    const isMarket = category === 'Market Success';
    return (isPest || isMarket)
      ? 'bg-tertiary/10 text-tertiary'
      : 'bg-primary/10 text-primary';
  }

  timeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  }
}