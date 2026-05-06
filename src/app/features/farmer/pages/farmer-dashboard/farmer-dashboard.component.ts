import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FarmerDashboardService } from '../../../../core/services/farmer/farmer-dashboard/farmer-dashboard.service';
import { FarmerMarketService } from '../../../../core/services/farmer/farmer-market/farmer-market.service';
import { AddCropModalComponent } from '../../pages/add-crop-modal/add-crop-modal.component';
import { Crop } from '../../../../core/models/farmer/farmer-dashboard.model';
import { CreateProductRequest } from '../../../../core/models/farmer/farmer-market.model';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCropModalComponent],
  templateUrl: './farmer-dashboard.component.html',
  styleUrl: './farmer-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FarmerDashboardComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  readonly svc    = inject(FarmerDashboardService);
  readonly mktSvc = inject(FarmerMarketService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ── Market Panel ───────────────────────────────────────────────────────────
  /** which tab is active: 'products' | 'orders' */
  marketTab: 'products' | 'orders' = 'products';

  // ── Add Product Modal ──────────────────────────────────────────────────────
  addProductOpen   = false;
  addProductError  = '';
  productImgPreview: string | null = null;

  newProduct: CreateProductRequest = {
    productName: '',
    price: 0,
    stock: 0,
    description: '',
    category: '',
    bulkAvailable: false,
    bulkQuantity: undefined,
    bulkPrice: undefined,
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.svc.loadDashboard();

    // Load market data
    this.mktSvc.loadMyProducts();
    this.mktSvc.loadMyOrders();

    // Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => this.svc.loadWeather(pos.coords.latitude, pos.coords.longitude),
        ()  => this.fetchLocationAutomatically(),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      this.fetchLocationAutomatically();
    }

    // Subscribe all streams for OnPush refresh
    const streams: Observable<any>[] = [
      this.svc.user$, this.svc.crops$, this.svc.weather$,
      this.svc.seasonal$, this.svc.notifications$, this.svc.unreadCount$,
      this.svc.loading$, this.svc.weatherAlerts$, this.svc.modalOpen$,
      this.svc.activeCropCount$, this.svc.cropSchedules$,
      this.svc.scheduleModalOpen$, this.svc.selectedSchedule$,
      this.mktSvc.myProducts$, this.mktSvc.myOrders$,
      this.mktSvc.productsLoading$, this.mktSvc.ordersLoading$,
      this.mktSvc.addLoading$,
    ];
    streams.forEach(obs =>
      obs.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck())
    );
  }

  private fetchLocationAutomatically(): void {
    this.svc.getAutoLocationByIp().pipe(takeUntil(this.destroy$)).subscribe(coords => {
      this.svc.loadWeather(coords.lat, coords.lon);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Market Panel ───────────────────────────────────────────────────────────

  switchTab(tab: 'products' | 'orders'): void {
    this.marketTab = tab;
    if (tab === 'products') this.mktSvc.loadMyProducts();
    if (tab === 'orders')   this.mktSvc.loadMyOrders();
  }

  /** Scroll the management section into view (called from Quick Actions) */
  scrollToMarket(): void {
    setTimeout(() => {
      document.querySelector('.pm-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  toggleProduct(id: string): void {
    this.mktSvc.toggleDeleteProduct(id).subscribe();
  }

  updateOrderStatus(orderId: string, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.mktSvc.updateOrderStatus(orderId, status).subscribe();
  }

  // ── Add Product Modal ──────────────────────────────────────────────────────

  openAddProduct(): void {
    this.addProductOpen  = true;
    this.addProductError = '';
    this.productImgPreview = null;
    this.newProduct = { productName: '', price: 0, stock: 0, description: '', category: '', bulkAvailable: false };
    this.cdr.markForCheck();
  }

  closeAddProduct(): void {
    this.addProductOpen = false;
    this.cdr.markForCheck();
  }

  onProductImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.newProduct.img = file;
    const reader = new FileReader();
    reader.onload = e => {
      this.productImgPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  submitAddProduct(): void {
    this.addProductError = '';

    // Validation
    if (!this.newProduct.productName.trim()) { this.addProductError = 'Product name is required.'; return; }
    if (!this.newProduct.price || this.newProduct.price <= 0) { this.addProductError = 'Enter a valid price.'; return; }
    if (!this.newProduct.stock || this.newProduct.stock < 0)  { this.addProductError = 'Enter a valid stock amount.'; return; }
    if (!this.newProduct.img) { this.addProductError = 'Please upload a product image.'; return; }

    this.mktSvc.addProduct(this.newProduct).subscribe({
      next: () => {
        this.closeAddProduct();
        this.marketTab = 'products';          // switch to products tab so user sees new item
        this.cdr.markForCheck();
      },
      error: err => {
        this.addProductError = err?.error?.message ?? 'Failed to add product. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }

  // ── Existing helpers ───────────────────────────────────────────────────────

  openAddCrop(): void { this.svc.openModal(); }
  markRead(id: string): void { this.svc.markAsRead(id); }

  trackByCrop(_: number, c: Crop) { return c._id; }

  getTaskIcon(type: string): string {
    const icons: any = { irrigation: 'water_drop', fertilization: 'science', harvest: 'agriculture' };
    return icons[type] || 'eco';
  }

  getTaskColor(type: string): string {
    const colors: any = { irrigation: '#0277bd', fertilization: '#8e24aa', harvest: '#e65100' };
    return colors[type] || '#0d631b';
  }

  formatTaskName(type: string): string {
    if (!type) return 'Unknown Task';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getCropIconBg(c: Crop)    { return c.status === 'planted' ? 'rgba(13,99,27,0.1)' : '#f0f2ee'; }
  getCropIconColor(c: Crop) { return c.status === 'planted' ? '#0d631b' : '#6c7c66'; }

  getNotifIcon(type: string)  {
    const map: any = { Marketplace: 'shopping_cart', Community: 'forum', 'AI Tools': 'bolt' };
    return map[type] || 'notifications';
  }
  getNotifIconBg(type: string)    {
    const map: any = { Marketplace: '#ffdbcf', Community: 'rgba(13,99,27,0.1)', 'AI Tools': '#ffdbca' };
    return map[type] || '#eee';
  }
  getNotifIconColor(type: string) {
    const map: any = { Marketplace: '#603f33', Community: '#0d631b', 'AI Tools': '#773200' };
    return map[type] || '#333';
  }

  get firstName(): string { return this.svc.user?.name?.split(' ')[0] || 'Farmer'; }
}