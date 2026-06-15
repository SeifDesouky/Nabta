import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export type FarmerProfileTab = 'info' | 'crops';

@Injectable({ providedIn: 'root' })
export class FarmerProfileService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;
  private readonly _editOpen$ = new BehaviorSubject<boolean>(false);
  private readonly _saving$   = new BehaviorSubject<boolean>(false);

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

  readonly editOpen$ = this._editOpen$.asObservable();
  readonly saving$   = this._saving$.asObservable();
  // ── Getters ──
  get user()      { return this._user$.getValue(); }
  get profile()   { return this._profile$.getValue(); }
  get crops()     { return this._crops$.getValue(); }
  get loading()   { return this._loading$.getValue(); }
  get activeTab() { return this._activeTab$.getValue(); }
  get editOpen() { return this._editOpen$.getValue(); }
  get saving()   { return this._saving$.getValue(); }

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
  openEditModal()  { this._editOpen$.next(true); }
closeEditModal() { this._editOpen$.next(false); }

updateProfile(payload: { name: string; phone: string; region: string; climate: string; soilType: string }): void {
  this._saving$.next(true);
  forkJoin({
    user:    this.http.put<any>(`${this.BASE}user/update`, { name: payload.name, phone: payload.phone })
                      .pipe(catchError(() => of(null))),
    profile: this.http.put<any>(`${this.BASE}user/profile/update`, {
                region: payload.region, climate: payload.climate, soilType: payload.soilType
              }).pipe(catchError(() => of(null))),
  }).subscribe(({ user, profile }) => {
    if (user)    this._user$.next({ ...this._user$.getValue(), ...user.user });
    if (profile) this._profile$.next({ ...this._profile$.getValue(), ...profile.profile });
    this._saving$.next(false);
    this._editOpen$.next(false);
  });
}
}