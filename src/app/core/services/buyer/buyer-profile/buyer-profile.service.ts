import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiServiceService } from '../../API/api-service.service';
import { BuyerProfileData, BuyerUserData } from '../../../models/buyer/buyer.model';

@Injectable({ providedIn: 'root' })
export class BuyerProfileService {
  private readonly api = inject(ApiServiceService);

  // ── State ─────────────────────────────────────────────────────────────────
  private readonly _user$    = new BehaviorSubject<BuyerUserData | null>(null);
  private readonly _profile$ = new BehaviorSubject<BuyerProfileData | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _saving$  = new BehaviorSubject<boolean>(false);
  private readonly _editOpen$ = new BehaviorSubject<boolean>(false);

  readonly user$     = this._user$.asObservable();
  readonly profile$  = this._profile$.asObservable();
  readonly loading$  = this._loading$.asObservable();
  readonly saving$   = this._saving$.asObservable();
  readonly editOpen$ = this._editOpen$.asObservable();

  activeTab: 'info' | 'orders' = 'info';

  // ── Load ──────────────────────────────────────────────────────────────────
  loadProfile(): void {
    this._loading$.next(true);
    this.api.get<{ user: BuyerUserData; profile: BuyerProfileData }>('user/myInfo').subscribe({
      next: res => {
        this._user$.next(res.user);
        this._profile$.next(res.profile);
        this._loading$.next(false);
      },
      error: () => this._loading$.next(false),
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────
  updateProfile(form: { name: string; phone: string; company: string; address: string }): void {
    this._saving$.next(true);

    const userPayload   = { name: form.name, phone: form.phone };
    const profilePayload = { company: form.company, address: form.address };

    this.api.put<{ user: BuyerUserData }>('user/update', userPayload).subscribe({
      next: res => {
        this._user$.next(res.user);
        // ── ثم نحدث الـ profile ──
        this.api.put<{ profile: BuyerProfileData }>('user/buyer/profile/update', profilePayload).subscribe({
          next: r => {
            this._profile$.next(r.profile);
            this._saving$.next(false);
            this._editOpen$.next(false);
          },
          error: () => this._saving$.next(false),
        });
      },
      error: () => this._saving$.next(false),
    });
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  openEditModal():  void { this._editOpen$.next(true);  }
  closeEditModal(): void { this._editOpen$.next(false); }

  // ── Tab ───────────────────────────────────────────────────────────────────
  setTab(tab: 'info' | 'orders'): void { this.activeTab = tab; }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getInitials(name: string): string {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}