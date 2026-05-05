import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject, Observable, forkJoin,
  catchError, of, tap, throwError,map
} from 'rxjs';
import {
  Crop, CreateCropRequest, CropSchedule,
  WeatherData, SeasonalAnalysis,
  Notification, MyInfoResponse, FarmerUser,
  CropScheduleItem,
} from '../../../models/farmer/farmer-dashboard.model'

@Injectable({ providedIn: 'root' })
export class FarmerDashboardService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // ── State ─────────────────────────────────────────────────────────────────
  private readonly _user$             = new BehaviorSubject<FarmerUser | null>(null);
  private readonly _crops$            = new BehaviorSubject<Crop[]>([]);
  private readonly _activeCropCount$  = new BehaviorSubject<number>(0);
  private readonly _weather$          = new BehaviorSubject<WeatherData | null>(null);
  private readonly _seasonal$         = new BehaviorSubject<SeasonalAnalysis | null>(null);
  private readonly _notifications$    = new BehaviorSubject<Notification[]>([]);
  private readonly _unreadCount$      = new BehaviorSubject<number>(0);
  private readonly _loading$          = new BehaviorSubject<boolean>(false);
  private readonly _cropLoading$      = new BehaviorSubject<boolean>(false);
  private readonly _addCropLoading$   = new BehaviorSubject<boolean>(false);
  private readonly _modalOpen$        = new BehaviorSubject<boolean>(false);
  private readonly _weatherAlerts$    = new BehaviorSubject<string[]>([]);

  // ── Observables ───────────────────────────────────────────────────────────
  readonly user$            = this._user$.asObservable();
  readonly crops$           = this._crops$.asObservable();
  readonly activeCropCount$ = this._activeCropCount$.asObservable();
  readonly weather$         = this._weather$.asObservable();
  readonly seasonal$        = this._seasonal$.asObservable();
  readonly notifications$   = this._notifications$.asObservable();
  readonly unreadCount$     = this._unreadCount$.asObservable();
  readonly loading$         = this._loading$.asObservable();
  readonly cropLoading$     = this._cropLoading$.asObservable();
  readonly addCropLoading$  = this._addCropLoading$.asObservable();
  readonly modalOpen$       = this._modalOpen$.asObservable();
  readonly weatherAlerts$   = this._weatherAlerts$.asObservable();

  // ── Getters ───────────────────────────────────────────────────────────────
  get user():           FarmerUser | null   { return this._user$.getValue(); }
  get crops():          Crop[]              { return this._crops$.getValue(); }
  get activeCropCount():number              { return this._activeCropCount$.getValue(); }
  get weather():        WeatherData | null  { return this._weather$.getValue(); }
  get seasonal():       SeasonalAnalysis | null { return this._seasonal$.getValue(); }
  get notifications():  Notification[]      { return this._notifications$.getValue(); }
  get unreadCount():    number              { return this._unreadCount$.getValue(); }
  get loading():        boolean             { return this._loading$.getValue(); }
  get cropLoading():    boolean             { return this._cropLoading$.getValue(); }
  get addCropLoading(): boolean             { return this._addCropLoading$.getValue(); }
  get modalOpen():      boolean             { return this._modalOpen$.getValue(); }
  get weatherAlerts():  string[]            { return this._weatherAlerts$.getValue(); }

private readonly _cropSchedules$ = new BehaviorSubject<CropScheduleItem[]>([]);
  readonly cropSchedules$ = this._cropSchedules$.asObservable();

  private readonly _selectedSchedule$ = new BehaviorSubject<CropScheduleItem | null>(null);
  readonly selectedSchedule$ = this._selectedSchedule$.asObservable();

  private readonly _scheduleModalOpen$ = new BehaviorSubject<boolean>(false);
  readonly scheduleModalOpen$ = this._scheduleModalOpen$.asObservable();

  // ── Load Dashboard ────────────────────────────────────────────────────────
  // loadDashboard(): void {
  //   this._loading$.next(true);

  //   forkJoin({
  //     info:         this.http.get<MyInfoResponse>(`${this.BASE}user/myInfo`).pipe(catchError(() => of(null))),
  //     schedules:    this.http.get<CropScheduleItem[]>(`${this.BASE}crop/my-schedule`).pipe(catchError(() => of([]))),
  //     activeCount:  this.http.get<number>(`${this.BASE}crop/active_crops`).pipe(catchError(() => of(0))),
  //     unread:       this.http.get<number>(`${this.BASE}notification/unread`).pipe(catchError(() => of(0))),
  //     notifications:this.http.get<Notification[]>(`${this.BASE}notification/`).pipe(catchError(() => of([] as Notification[]))),
  //   }).subscribe(({ info, schedules, activeCount, unread, notifications }) => {
  //     if (info) this._user$.next(info.user);
  //     this._cropSchedules$.next(schedules); // 🆕 تحديث الجداول
  //     this._activeCropCount$.next(activeCount);
  //     this._unreadCount$.next(unread);
  //     this._notifications$.next(notifications.slice(0, 5));
  //     this._loading$.next(false);

      
  //     // Load weather if farmer has location
  //     const profile = (info as any)?.profile;
  //     if (profile?.lat && profile?.lon) {
  //       this.loadWeather(profile.lat, profile.lon);
  //     }
  //   });
    
  // }
  loadDashboard(): void {
    this._loading$.next(true);

    forkJoin({
      info:         this.http.get<MyInfoResponse>(`${this.BASE}user/myInfo`).pipe(catchError(() => of(null))),
      // ⚠️ التعديل هنا: لو حصل أي إيرور، هنطبع الخطأ ونرجع Array فاضية عشان الداشبورد ماتقفش
      schedules:    this.http.get<CropScheduleItem[]>(`${this.BASE}crop/my-schedule`).pipe(
                      tap(res => console.log('✅ Schedules Loaded:', res)),
                      catchError((err) => {
                        console.error('❌ Error loading schedules:', err);
                        return of([]); // نرجع فاضي عشان ميكسرش الـ forkJoin
                      })
                    ),
      activeCount:  this.http.get<number>(`${this.BASE}crop/active_crops`).pipe(catchError(() => of(0))),
      unread:       this.http.get<number>(`${this.BASE}notification/unread`).pipe(catchError(() => of(0))),
      notifications:this.http.get<Notification[]>(`${this.BASE}notification/`).pipe(catchError(() => of([] as Notification[]))),
    }).subscribe(({ info, schedules, activeCount, unread, notifications }) => {
      if (info) this._user$.next(info.user);
      
      this._cropSchedules$.next(schedules); // تحديث الجداول هنا
      
      this._activeCropCount$.next(activeCount);
      this._unreadCount$.next(unread);
      this._notifications$.next(notifications.slice(0, 5));
      this._loading$.next(false);

      const profile = (info as any)?.profile;
      if (profile?.lat && profile?.lon) {
        this.loadWeather(profile.lat, profile.lon);
      }
    });
  }
  openScheduleModal(schedule: CropScheduleItem): void {
    this._selectedSchedule$.next(schedule);
    this._scheduleModalOpen$.next(true);
  }

  closeScheduleModal(): void {
    this._scheduleModalOpen$.next(false);
    setTimeout(() => this._selectedSchedule$.next(null), 300); // تأخير بسيط عشان الأنيميشن
  }

  // ── Weather ───────────────────────────────────────────────────────────────
  getAutoLocationByIp(): Observable<{lat: number, lon: number}> {
    // هنستخدم API مجاني بيجيب الإحداثيات بناءً على شبكة الإنترنت الخاصة بالمستخدم
    return this.http.get<any>('https://ipapi.co/json/').pipe(
      map(res => {
        if (res.latitude && res.longitude) {
          return { lat: res.latitude, lon: res.longitude };
        }
        throw new Error('Location not found in IP response');
      }),
      catchError(() => {
        // لو الـ API ده كمان فشل لأي سبب، هنرجع إحداثيات مصر كحماية أخيرة
        return of({ lat: 26.8206, lon: 30.8025 }); 
      })
    );
  }

  loadWeather(lat: number, lon: number): void {
    forkJoin({
      weather: this.http.get<WeatherData>(`${this.BASE}weather/current?lat=${lat}&lon=${lon}`).pipe(catchError(() => of(null))),
      seasonal: this.http.get<SeasonalAnalysis>(`${this.BASE}weather/season?lat=${lat}&lon=${lon}`).pipe(catchError(() => of(null))),
      alerts:   this.http.get<{ alerts: string[] }>(`${this.BASE}weather/alerts?lat=${lat}&lon=${lon}`).pipe(catchError(() => of({ alerts: [] }))),
    }).subscribe(({ weather, seasonal, alerts }) => {
      if (weather)  this._weather$.next(weather);
      if (seasonal) this._seasonal$.next(seasonal);
      this._weatherAlerts$.next(alerts?.alerts ?? []);
    });
  }

  // Save location then reload weather
  // saveLocation(lat: number, lon: number): void {
  //   this.http.patch(`${this.BASE}user/farmer`, { lat, lon }).subscribe(() => {
  //     this.loadWeather(lat, lon);
  //   });
  // }

  // ── Crops ─────────────────────────────────────────────────────────────────
  addCrop(payload: CreateCropRequest): Observable<Crop> {
    this._addCropLoading$.next(true);
    return this.http.post<Crop>(`${this.BASE}crop/`, payload).pipe(
      tap(crop => {
        // this._crops$.next([crop, ...this._crops$.getValue()]);
        // this._activeCropCount$.next(this._activeCropCount$.getValue() + 1);
        this.loadDashboard();
        this.closeModal();
      }),
      catchError(err => { this._addCropLoading$.next(false); return throwError(() => err); }),
      tap(() => this._addCropLoading$.next(false)),
    );
  }

  // getCropSchedule(cropId: string): Observable<CropSchedule> {
  //   return this.http.get<CropSchedule>(`${this.BASE}crop/${cropId}/schedule`);
  // }

  editCrop(cropId: string, data: Partial<CreateCropRequest>): Observable<Crop> {
    return this.http.patch<Crop>(`${this.BASE}crop/edit/${cropId}`, data).pipe(
      tap(updated => {
        this._crops$.next(
          this._crops$.getValue().map(c => c._id === cropId ? { ...c, ...updated } : c)
        );
      })
    );
  }
  deleteCrop(id: string): Observable<any> {
    return this.http.patch(`${this.BASE}crop/delete/${id}`, {});
  }

  getDeletedCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(`${this.BASE}crop/deleted`);
  }
  // ── Notifications ─────────────────────────────────────────────────────────
  markAsRead(notifId: string): void {
    this.http.patch(`${this.BASE}notification/${notifId}`, {}).subscribe(() => {
      this._notifications$.next(
        this._notifications$.getValue().map(n =>
          n._id === notifId ? { ...n, isRead: true } : n
        )
      );
      const cur = this._unreadCount$.getValue();
      this._unreadCount$.next(Math.max(0, cur - 1));
    });
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  openModal(): void  { this._modalOpen$.next(true); }
  closeModal(): void { this._modalOpen$.next(false); }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getInitials(name: string): string {
    return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '??';
  }

  getCropHealthPct(crop: Crop): number {
    if (crop.lastNotified.harvest) return 100;
    // estimate based on status
    const map: Record<string, number> = { planned: 30, planted: 75, harvested: 100 };
    return map[crop.status] ?? 60;
  }

  getCropStatusConfig(crop: Crop): { label: string; bg: string; color: string } {
    if (crop.lastNotified.harvest) {
      return { label: 'Harvested', bg: 'rgba(13,99,27,0.1)', color: '#0d631b' };
    }
    const map: Record<string, { label: string; bg: string; color: string }> = {
      planned:   { label: 'Planned',  bg: '#e8e8e8',              color: '#40493d' },
      planted:   { label: 'Planted',  bg: 'rgba(13,99,27,0.10)',  color: '#0d631b' },
      harvested: { label: 'Harvested',bg: 'rgba(13,99,27,0.10)',  color: '#0d631b' },
    };
    return map[crop.status] ?? { label: crop.status, bg: '#eee', color: '#6c7c66' };
  }

  getHealthColor(pct: number): string {
    if (pct >= 85) return '#0d631b';
    if (pct >= 60) return '#2e7d32';
    return '#8e3d00';
  }

  timeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' });
  }
}
import { environment } from '../../../../../environments/environment';
