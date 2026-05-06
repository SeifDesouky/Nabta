import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FarmerMarketService } from '../../../../core/services/farmer/farmer-market/farmer-market.service';
import { IProduct, IOrder, CreateProductRequest } from '../../../../core/models/farmer/farmer-market.model';

@Component({
  selector: 'app-farmer-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './farmer-products.component.html',
  styleUrl: './farmer-products.component.css'
})
export class FarmerProductsComponent {

  private readonly destroy$ = new Subject<void>();
  readonly mktSvc = inject(FarmerMarketService);
  private readonly cdr = inject(ChangeDetectorRef);
 
  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab: 'products' | 'orders' = 'products';
 
  // ── Products state ────────────────────────────────────────────────────────
  allProducts:      IProduct[] = [];
  filteredProducts: IProduct[] = [];
  productSearch = '';
  productFilter: 'all' | 'active' | 'inactive' = 'all';
 
  // ── Orders state ──────────────────────────────────────────────────────────
  allOrders:      IOrder[] = [];
  filteredOrders: IOrder[] = [];
  orderSearch = '';
  orderFilter: 'all' | 'pending' | 'shipped' | 'delivered' | 'rejected' | 'canceled' = 'all';
 
  // ── Add Product Modal ─────────────────────────────────────────────────────
  addProductOpen   = false;
  addProductError  = '';
  productImgPreview: string | null = null;
  fieldErr: {
  name?: boolean;
  price?: boolean;
  stock?: boolean;
  img?: boolean;
} = {};
 
  newProduct: CreateProductRequest = this.blankProduct();
 
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.mktSvc.loadMyProducts();
    this.mktSvc.loadMyOrders();
 
    this.mktSvc.myProducts$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.allProducts = products;
      this.filterProducts();
      this.cdr.markForCheck();
    });
 
    this.mktSvc.myOrders$.pipe(takeUntil(this.destroy$)).subscribe(orders => {
      this.allOrders = orders;
      this.filterOrders();
      this.cdr.markForCheck();
    });
 
    [this.mktSvc.productsLoading$, this.mktSvc.ordersLoading$, this.mktSvc.addLoading$]
      .forEach(obs => obs.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck()));
  }
 
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
 
  // ── Tabs ──────────────────────────────────────────────────────────────────
  setTab(tab: 'products' | 'orders'): void {
    this.activeTab = tab;
    if (tab === 'products') this.mktSvc.loadMyProducts();
    if (tab === 'orders')   this.mktSvc.loadMyOrders();
  }
 
  // ── Stats ─────────────────────────────────────────────────────────────────
  get pendingOrdersCount(): number {
    return this.allOrders.filter(o => o.status === 'pending').length;
  }
 
  get totalRevenue(): number {
    return this.allOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }
 
  // ── Products ──────────────────────────────────────────────────────────────
  filterProducts(): void {
    let list = [...this.allProducts];
    if (this.productFilter === 'active')   list = list.filter(p => !p.isDeleted);
    if (this.productFilter === 'inactive') list = list.filter(p =>  p.isDeleted);
    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      list = list.filter(p =>
        p.productName.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    this.filteredProducts = list;
  }
 
  toggleProduct(id: string): void {
    this.mktSvc.toggleDeleteProduct(id).subscribe();
  }
 
  // ── Orders ────────────────────────────────────────────────────────────────
  filterOrders(): void {
    let list = [...this.allOrders];
    if (this.orderFilter !== 'all') list = list.filter(o => o.status === this.orderFilter);
    if (this.orderSearch.trim()) {
      const q = this.orderSearch.toLowerCase();
      list = list.filter(o =>
        o._id.toLowerCase().includes(q) ||
        o.shippingAddress.toLowerCase().includes(q)
      );
    }
    this.filteredOrders = list;
  }
 
  changeStatus(orderId: string, status: string): void {
    this.mktSvc.updateOrderStatus(orderId, status).subscribe();
  }
 
  // ── Add Product Modal ─────────────────────────────────────────────────────
  openAddProduct(): void {
    this.newProduct        = this.blankProduct();
    this.addProductError   = '';
    this.productImgPreview = null;
    this.fieldErr          = {};
    this.addProductOpen    = true;
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
    this.fieldErr['img'] = false;
    const reader = new FileReader();
    reader.onload = e => {
      this.productImgPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }
 
  submitAddProduct(): void {
    this.addProductError = '';
    this.fieldErr = {};
 
    // Validate
    if (!this.newProduct.productName?.trim()) this.fieldErr['name'] = true;
    if (!this.newProduct.price || this.newProduct.price <= 0) this.fieldErr['price'] = true;
    if (this.newProduct.stock == null || this.newProduct.stock < 0) this.fieldErr['stock'] = true;
    if (!this.newProduct.img) this.fieldErr['img'] = true;
 
    if (Object.values(this.fieldErr).some(Boolean)) {
      this.cdr.markForCheck();
      return;
    }
 
    this.mktSvc.addProduct(this.newProduct).subscribe({
      next: () => {
        this.closeAddProduct();
        this.activeTab = 'products';
      },
      error: err => {
        this.addProductError = err?.error?.message ?? 'Failed to add product. Try again.';
        this.cdr.markForCheck();
      },
    });
  }
 
  // ── Helpers ───────────────────────────────────────────────────────────────
 private blankProduct(): CreateProductRequest {
  return {
    productName: '',
    price: 0,
    stock: 0,
    description: '',
    category: '',
    bulkAvailable: false,
    features: [] 
  };
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
