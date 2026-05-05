import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export type FarmerProfileTab = 'info' | 'crops';

@Injectable({ providedIn: 'root' })
export class FarmerProfileService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // ── State ──
  private readonly _user$      = new BehaviorSubject<any | null>(null);
  private readonly _profile$   = new BehaviorSubject<any | null>(null);
  private readonly _crops$     = new BehaviorSubject<any[]>([]);
  private readonly _loading$   = new BehaviorSubject<boolean>(false);
  private readonly _activeTab$ = new BehaviorSubject<FarmerProfileTab>('info');

  // ── Observables ──
  readonly user$      = this._user$.asObservable();
  readonly profile$   = this._profile$.asObservable();
  readonly crops$     = this._crops$.asObservable();
  readonly loading$   = this._loading$.asObservable();
  readonly activeTab$ = this._activeTab$.asObservable();

  // ── Getters ──
  get user()      { return this._user$.getValue(); }
  get profile()   { return this._profile$.getValue(); }
  get crops()     { return this._crops$.getValue(); }
  get loading()   { return this._loading$.getValue(); }
  get activeTab() { return this._activeTab$.getValue(); }

  // ── Load Profile ──
  loadProfile(): void {
    this._loading$.next(true);

    forkJoin({
      info: this.http.get<any>(`${this.BASE}user/myInfo`).pipe(catchError(() => of(null))),
      crops: this.http.get<any[]>(`${this.BASE}crop/my_crops`).pipe(catchError(() => of([]))),
    }).subscribe(({ info, crops }) => {
      if (info) {
        this._user$.next(info.user);
        this._profile$.next(info.profile); // ده فيه region, soilType, climate
      }
      this._crops$.next(crops);
      this._loading$.next(false);
    });
  }

  setTab(tab: FarmerProfileTab) {
    this._activeTab$.next(tab);
  }

  // ── Helpers ──
  getInitials(name: string): string {
    return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '??';
  }

  timeAgo(dateStr: string): string {
    if(!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days < 30) return `${days} days ago`;
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}