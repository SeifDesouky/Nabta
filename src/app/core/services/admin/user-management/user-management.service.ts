import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject, Observable, catchError, finalize, tap, throwError,
} from 'rxjs';
import {
  User, PaginatedResponse, UserStatsResponse, ToggleStatusResponse,
  DeleteUserResponse, RoleFilter, StatusFilter, UserFilters,
  RoleDisplay, StatusDisplay,
} from '../../../models/adminModels/user-management.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl+'user';

  readonly LIMIT = 8;

  // ─── State ────────────────────────────────────────────────────────────────
  private readonly _users$        = new BehaviorSubject<User[]>([]);
  private readonly _stats$        = new BehaviorSubject<UserStatsResponse>({ total: 0 });
  private readonly _loading$      = new BehaviorSubject<boolean>(false);
  private readonly _statsLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _actionLoading$= new BehaviorSubject<Set<string>>(new Set());
  private readonly _currentPage$  = new BehaviorSubject<number>(1);
  private readonly _totalPages$   = new BehaviorSubject<number>(1);
  private readonly _totalResult$  = new BehaviorSubject<number>(0);
  private readonly _selectedUser$ = new BehaviorSubject<User | null>(null);
  private readonly _modalOpen$    = new BehaviorSubject<boolean>(false);
  private readonly _filters$      = new BehaviorSubject<UserFilters>({
    role: 'all', status: 'all', search: '',
  });

  // ─── Public Observables ───────────────────────────────────────────────────
  readonly users$        = this._users$.asObservable();
  readonly stats$        = this._stats$.asObservable();
  readonly loading$      = this._loading$.asObservable();
  readonly statsLoading$ = this._statsLoading$.asObservable();
  readonly actionLoading$= this._actionLoading$.asObservable();
  readonly currentPage$  = this._currentPage$.asObservable();
  readonly totalPages$   = this._totalPages$.asObservable();
  readonly totalResult$  = this._totalResult$.asObservable();
  readonly selectedUser$ = this._selectedUser$.asObservable();
  readonly modalOpen$    = this._modalOpen$.asObservable();
  readonly filters$      = this._filters$.asObservable();

  // ─── Snapshot Getters ─────────────────────────────────────────────────────
  get users():        User[]              { return this._users$.getValue(); }
  get stats():        UserStatsResponse   { return this._stats$.getValue(); }
  get loading():      boolean             { return this._loading$.getValue(); }
  get statsLoading(): boolean             { return this._statsLoading$.getValue(); }
  get currentPage():  number              { return this._currentPage$.getValue(); }
  get totalPages():   number              { return this._totalPages$.getValue(); }
  get totalResult():  number              { return this._totalResult$.getValue(); }
  get selectedUser(): User | null         { return this._selectedUser$.getValue(); }
  get modalOpen():    boolean             { return this._modalOpen$.getValue(); }
  get filters():      UserFilters         { return this._filters$.getValue(); }

  // ─── Load Stats ───────────────────────────────────────────────────────────
  loadStats(): void {
    this._statsLoading$.next(true);
    this.http.get<UserStatsResponse>(`${this.BASE}/stats`).pipe(
      tap(s => this._stats$.next(s)),
      catchError(err => { console.error('Stats failed', err); return throwError(() => err); }),
      finalize(() => this._statsLoading$.next(false)),
    ).subscribe();
  }

  // ─── Load Users ───────────────────────────────────────────────────────────
  loadUsers(page = 1, overrideFilters?: Partial<UserFilters>): void {
    this._loading$.next(true);
    const f = { ...this._filters$.getValue(), ...overrideFilters };

    let params = new HttpParams()
      .set('page',   page.toString())
      .set('limit',  this.LIMIT.toString())
      .set('sortby', 'createdAt')
      .set('order',  'desc');

    if (f.role   !== 'all') params = params.set('role',   f.role);
    if (f.status !== 'all') params = params.set('status', f.status);
    if (f.search.trim())    params = params.set('search', f.search.trim());

    this.http.get<PaginatedResponse<User>>(`${this.BASE}/all_users`, { params }).pipe(
      tap(res => {
        this._users$.next(res.result);
        this._currentPage$.next(res.page);
        this._totalPages$.next(res.totalPages);
        this._totalResult$.next(res.totalResult);
      }),
      catchError(err => { console.error('Users failed', err); return throwError(() => err); }),
      finalize(() => this._loading$.next(false)),
    ).subscribe();
  }

  // ─── Toggle Status (block / unblock) ─────────────────────────────────────
  toggleStatus(userId: string): Observable<ToggleStatusResponse> {
    this._setActionLoading(userId, true);
    return this.http.patch<ToggleStatusResponse>(`${this.BASE}/status/${userId}`, {}).pipe(
      tap(res => {
        const updated = this._users$.getValue().map(u =>
          u._id === userId ? { ...u, status: res.data.status as User['status'] } : u
        );
        this._users$.next(updated);
      }),
      catchError(err => { console.error('Toggle failed', err); return throwError(() => err); }),
      finalize(() => this._setActionLoading(userId, false)),
    );
  }

  // ─── Soft Delete / Restore ────────────────────────────────────────────────
  deleteUser(userId: string): Observable<DeleteUserResponse> {
    this._setActionLoading(userId, true);
    return this.http.patch<DeleteUserResponse>(`${this.BASE}/delete/${userId}`, {}).pipe(
      tap(res => {
        // Remove from list if deleted, or update if restored
        if (res.isDeleted) {
          this._users$.next(this._users$.getValue().filter(u => u._id !== userId));
          const total = this._totalResult$.getValue();
          this._totalResult$.next(Math.max(0, total - 1));
        } else {
          const updated = this._users$.getValue().map(u =>
            u._id === userId ? { ...u, isDeleted: false, status: 'active' as User['status'] } : u
          );
          this._users$.next(updated);
        }
      }),
      catchError(err => { console.error('Delete failed', err); return throwError(() => err); }),
      finalize(() => this._setActionLoading(userId, false)),
    );
  }

  // ─── Filters ──────────────────────────────────────────────────────────────
  setRoleFilter(role: RoleFilter): void {
    const f = { ...this._filters$.getValue(), role };
    this._filters$.next(f);
    this._currentPage$.next(1);
    this.loadUsers(1, f);
  }

  setStatusFilter(status: StatusFilter): void {
    const f = { ...this._filters$.getValue(), status };
    this._filters$.next(f);
    this._currentPage$.next(1);
    this.loadUsers(1, f);
  }

  setSearch(search: string): void {
    const f = { ...this._filters$.getValue(), search };
    this._filters$.next(f);
    this._currentPage$.next(1);
    this.loadUsers(1, f);
  }

  // ─── Pagination ───────────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this._totalPages$.getValue()) return;
    this._currentPage$.next(page);
    this.loadUsers(page);
  }

  // ─── Modal ────────────────────────────────────────────────────────────────
  openModal(user: User): void {
    this._selectedUser$.next(user);
    this._modalOpen$.next(true);
  }

  closeModal(): void {
    this._modalOpen$.next(false);
    this._selectedUser$.next(null);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  isActionLoading(userId: string): boolean {
    return this._actionLoading$.getValue().has(userId);
  }

  private _setActionLoading(id: string, state: boolean): void {
    const set = new Set(this._actionLoading$.getValue());
    state ? set.add(id) : set.delete(id);
    this._actionLoading$.next(set);
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days  < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' });
  }

  getRoleDisplay(role: string): RoleDisplay {
    const map: Record<string, RoleDisplay> = {
      farmer: { label: 'Farmer', icon: 'agriculture',       color: '#0d631b', bg: 'rgba(13,99,27,0.10)'  },
      expert: { label: 'Expert', icon: 'verified',          color: '#0a5217', bg: 'rgba(13,99,27,0.10)'  },
      buyer:  { label: 'Buyer',  icon: 'shopping_bag',      color: '#40493d', bg: '#eeeeee'               },
      admin:  { label: 'Admin',  icon: 'admin_panel_settings', color: '#6b21a8', bg: 'rgba(107,33,168,0.10)' },
    };
    return map[role] ?? { label: role, icon: 'person', color: '#6c7c66', bg: '#eeeeee' };
  }

  getStatusDisplay(status: string): StatusDisplay {
    const map: Record<string, StatusDisplay> = {
      active:  { label: 'Active',   dot: '#0d631b', color: '#2b4228' },
      blocked: { label: 'Blocked',  dot: '#ba1a1a', color: '#ba1a1a' },
      pending: { label: 'Pending',  dot: '#f59e0b', color: '#92400e' },
    };
    return map[status] ?? { label: status, dot: '#9ca3af', color: '#6c7c66' };
  }
}