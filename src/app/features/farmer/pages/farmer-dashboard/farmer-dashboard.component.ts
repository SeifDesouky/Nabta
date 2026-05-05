import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FarmerDashboardService } from '../../../../core/services/farmer/farmer-dashboard/farmer-dashboard.service';
import { AddCropModalComponent } from '../../pages/add-crop-modal/add-crop-modal.component';
import { Crop } from '../../../../core/models/farmer/farmer-dashboard.model';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, AddCropModalComponent],
  templateUrl: './farmer-dashboard.component.html',
  styleUrl: './farmer-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ مهم
})
export class FarmerDashboardComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  readonly svc = inject(FarmerDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.svc.loadDashboard();

 
    if (navigator.geolocation) {
      console.log('⏳ جاري تحديد الموقع الفعلي...');
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // المتصفح نجح وجاب المكان الفعلي بدقة
          console.log('✅ تم تحديد الموقع بنجاح:', pos.coords.latitude, pos.coords.longitude);
          this.svc.loadWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          // لو فشل تماماً بعد كل المحاولات
          console.warn('❌ فشل تحديد الموقع من المتصفح:', error.message);
          this.fetchLocationAutomatically(); // الـ IP كحل أخير ومؤقت
        },
        { 
          enableHighAccuracy: true, // 👈 السر هنا: بيجبر المتصفح يستخدم الـ GPS الفعلي مش شبكة النت
          timeout: 15000,           // 👈 اديله 15 ثانية يحاول يلقط إشارة (مهم جداً خصوصاً في اللابتوب)
          maximumAge: 0             // 👈 متجيبش أي مكان متخزن في الكاش القديم بتاع المتصفح
        }
      );
    } else {
       this.fetchLocationAutomatically();
    }

    // ✅ refresh UI مع OnPush
const streams: Observable<any>[] = [
  this.svc.user$,
  this.svc.crops$,
  this.svc.weather$,
  this.svc.seasonal$,
  this.svc.notifications$,
  this.svc.unreadCount$,
  this.svc.loading$,
  this.svc.weatherAlerts$,
  this.svc.modalOpen$,
  this.svc.activeCropCount$,
  this.svc.cropSchedules$,       // 🆕 مهم جداً
  this.svc.scheduleModalOpen$,   // 🆕 مهم جداً
  this.svc.selectedSchedule$     // 🆕 مهم جداً
];

// ✅ تحديث الـ UI (نفس الكود بتاعك)
    streams.forEach(obs =>
  obs.pipe(takeUntil(this.destroy$)).subscribe(() => {
    this.cdr.markForCheck();
  })
);


  }

  
  private fetchLocationAutomatically(): void {
    this.svc.getAutoLocationByIp().pipe(takeUntil(this.destroy$)).subscribe(coords => {
      console.log('📍 Auto Location fetched:', coords);
      this.svc.loadWeather(coords.lat, coords.lon);
    });
  }


  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ───────── Actions ─────────
  openAddCrop(): void {
    this.svc.openModal();
  }

  markRead(id: string): void {   // ✅ توحيد الاسم
    this.svc.markAsRead(id);
  }

  // ───────── Helpers ─────────
  trackByCrop(_: number, c: Crop) {
    return c._id;
  }

  getTaskIcon(type: string): string {
    const icons: any = {
      irrigation: 'water_drop',
      fertilization: 'science',
      harvest: 'agriculture'
    };
    return icons[type] || 'eco';
  }

  getTaskColor(type: string): string {
    const colors: any = {
      irrigation: '#0277bd', // أزرق للمياه
      fertilization: '#8e24aa', // بنفسجي للسماد
      harvest: '#e65100' // برتقالي للحصاد
    };
    return colors[type] || '#0d631b';
  }

  formatTaskName(type: string): string {
    if (!type) return 'Unknown Task';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
  // 🎨 Crop UI
  getCropIconBg(c: Crop) {
    return c.status === 'planted'
      ? 'rgba(13,99,27,0.1)'
      : '#f0f2ee';
  }

  getCropIconColor(c: Crop) {
    return c.status === 'planted'
      ? '#0d631b'
      : '#6c7c66';
  }

  getNextTaskIcon(c: Crop) {
    if (c.lastNotified?.harvest) return 'check_circle';
    if (c.status === 'planned') return 'schedule';
    return 'agriculture';
  }

  getNextTaskLabel(c: Crop) {
    if (c.lastNotified?.harvest) return 'Harvest completed';
    if (c.status === 'planned') return 'Planting soon';
    return 'Monitor growth';
  }

  // 🔔 Notifications UI
  getNotifIcon(type: string) {
    const map: any = {
      Marketplace: 'shopping_cart',
      Community: 'forum',
      'AI Tools': 'bolt'
    };
    return map[type] || 'notifications';
  }

  getNotifIconBg(type: string) {
    const map: any = {
      Marketplace: '#ffdbcf',
      Community: 'rgba(13,99,27,0.1)',
      'AI Tools': '#ffdbca'
    };
    return map[type] || '#eee';
  }

  getNotifIconColor(type: string) {
    const map: any = {
      Marketplace: '#603f33',
      Community: '#0d631b',
      'AI Tools': '#773200'
    };
    return map[type] || '#333';
  }

  // 👋 Greeting
  get firstName(): string {
    return this.svc.user?.name?.split(' ')[0] || 'Farmer';
  }
}