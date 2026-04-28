import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  tap,
  throwError,
} from 'rxjs';
import {
  ExpertProfile,
  ExpertStatsResponse,
  FilterStatus,
  ManageExpertPayload,
  ManageExpertResponse,
  PaginatedResponse,
} from '../../../models/adminModels/expert-application.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExpertApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly BASE =environment.apiUrl+'user'; // adjust to your environment base URL

  // ─── State Subjects ─────────────────────────────────────────────────────────
  private readonly _experts$ = new BehaviorSubject<ExpertProfile[]>([]);
  private readonly _stats$ = new BehaviorSubject<ExpertStatsResponse>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _statsLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _actionLoading$ = new BehaviorSubject<Set<string>>(
    new Set()
  );
  private readonly _currentPage$ = new BehaviorSubject<number>(1);
  private readonly _totalPages$ = new BehaviorSubject<number>(1);
  private readonly _totalResult$ = new BehaviorSubject<number>(0);
  private readonly _selectedExpert$ = new BehaviorSubject<ExpertProfile | null>(
    null
  );
  private readonly _modalOpen$ = new BehaviorSubject<boolean>(false);
  private readonly _activeFilter$ = new BehaviorSubject<FilterStatus>('all');
  private readonly _searchQuery$ = new BehaviorSubject<string>('');

  readonly LIMIT = 6;

  // ─── Public Observables ──────────────────────────────────────────────────────
  readonly experts$ = this._experts$.asObservable();
  readonly stats$ = this._stats$.asObservable();
  readonly loading$ = this._loading$.asObservable();
  readonly statsLoading$ = this._statsLoading$.asObservable();
  readonly actionLoading$ = this._actionLoading$.asObservable();
  readonly currentPage$ = this._currentPage$.asObservable();
  readonly totalPages$ = this._totalPages$.asObservable();
  readonly totalResult$ = this._totalResult$.asObservable();
  readonly selectedExpert$ = this._selectedExpert$.asObservable();
  readonly modalOpen$ = this._modalOpen$.asObservable();
  readonly activeFilter$ = this._activeFilter$.asObservable();
  readonly searchQuery$ = this._searchQuery$.asObservable();

  // ─── Snapshot Getters (for template use) ────────────────────────────────────
  get experts(): ExpertProfile[] {
    return this._experts$.getValue();
  }
  get stats(): ExpertStatsResponse {
    return this._stats$.getValue();
  }
  get loading(): boolean {
    return this._loading$.getValue();
  }
  get statsLoading(): boolean {
    return this._statsLoading$.getValue();
  }
  get currentPage(): number {
    return this._currentPage$.getValue();
  }
  get totalPages(): number {
    return this._totalPages$.getValue();
  }
  get totalResult(): number {
    return this._totalResult$.getValue();
  }
  get selectedExpert(): ExpertProfile | null {
    return this._selectedExpert$.getValue();
  }
  get modalOpen(): boolean {
    return this._modalOpen$.getValue();
  }
  get activeFilter(): FilterStatus {
    return this._activeFilter$.getValue();
  }

  // ─── Fetch Expert Stats ──────────────────────────────────────────────────────
  loadStats(): void {
    this._statsLoading$.next(true);
    this.http
      .get<ExpertStatsResponse>(`${this.BASE}/expert_stats`)
      .pipe(
        tap((stats) => this._stats$.next(stats)),
        catchError((err) => {
          console.error('Failed to load expert stats', err);
          return throwError(() => err);
        }),
        finalize(() => this._statsLoading$.next(false))
      )
      .subscribe();
  }

  // ─── Fetch Experts (paginated + filtered) ───────────────────────────────────
  loadExperts(page: number = 1, filter?: FilterStatus, search?: string): void {
    this._loading$.next(true);

    const activeFilter = filter ?? this._activeFilter$.getValue();
    const activeSearch = search ?? this._searchQuery$.getValue();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', this.LIMIT.toString())
      .set('sortby', 'createdAt')
      .set('order', 'desc');

    if (activeFilter && activeFilter !== 'all') {
      params = params.set('expertStatus', activeFilter);
    }

    if (activeSearch?.trim()) {
      params = params.set('search', activeSearch.trim());
    }

    this.http
      .get<PaginatedResponse<ExpertProfile>>(`${this.BASE}/experts`, { params })
      .pipe(
        tap((res) => {
          this._experts$.next(res.result);
          this._currentPage$.next(res.page);
          this._totalPages$.next(res.totalPages);
          this._totalResult$.next(res.totalResult);
        }),
        catchError((err) => {
          console.error('Failed to load experts', err);
          return throwError(() => err);
        }),
        finalize(() => this._loading$.next(false))
      )
      .subscribe();
  }

  // ─── Manage Expert (approve/reject) ─────────────────────────────────────────
  manageExpert(
    userId: string,
    action: 'approve' | 'reject'
  ): Observable<ManageExpertResponse> {
    this._setActionLoading(userId, true);

    const payload: ManageExpertPayload = { action };

    return this.http
      .patch<ManageExpertResponse>(`${this.BASE}/expert/${userId}`, payload)
      .pipe(
        tap(() => {
          // Optimistically remove from list or update status
          const current = this._experts$.getValue();
          const updated = current.filter((e) => e.user._id !== userId);
          this._experts$.next(updated);

          // Update stats
          const stats = { ...this._stats$.getValue() };
          if (stats.pending > 0) stats.pending--;
          if (action === 'approve') stats.accepted++;
          else stats.rejected++;
          this._stats$.next(stats);

          // Update total result
          const total = this._totalResult$.getValue();
          this._totalResult$.next(Math.max(0, total - 1));
        }),
        catchError((err) => {
          console.error(`Failed to ${action} expert`, err);
          return throwError(() => err);
        }),
        finalize(() => this._setActionLoading(userId, false))
      );
  }

  // ─── Download CV ─────────────────────────────────────────────────────────────
  downloadCV(expertId: string, expertName: string): void {
    this.http
      .get(`${this.BASE}/userDetails/${expertId}/cv`, {
        responseType: 'blob',
      })
      .pipe(
        tap((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${expertName.replace(/\s+/g, '_')}_CV.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }),
        catchError((err) => {
          console.error('Failed to download CV', err);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  // ─── Filter ──────────────────────────────────────────────────────────────────
  setFilter(filter: FilterStatus): void {
    this._activeFilter$.next(filter);
    this._currentPage$.next(1);
    this.loadExperts(1, filter);
  }

  // ─── Search ──────────────────────────────────────────────────────────────────
  setSearch(query: string): void {
    this._searchQuery$.next(query);
    this._currentPage$.next(1);
    this.loadExperts(1, this._activeFilter$.getValue(), query);
  }

  // ─── Pagination ──────────────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this._totalPages$.getValue()) return;
    this._currentPage$.next(page);
    this.loadExperts(page);
  }

  // ─── Modal ───────────────────────────────────────────────────────────────────
  openModal(expert: ExpertProfile): void {
    this._selectedExpert$.next(expert);
    this._modalOpen$.next(true);
  }

  closeModal(): void {
    this._modalOpen$.next(false);
    this._selectedExpert$.next(null);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  isActionLoading(userId: string): boolean {
    return this._actionLoading$.getValue().has(userId);
  }

  private _setActionLoading(userId: string, state: boolean): void {
    const set = new Set(this._actionLoading$.getValue());
    state ? set.add(userId) : set.delete(userId);
    this._actionLoading$.next(set);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  }
}
