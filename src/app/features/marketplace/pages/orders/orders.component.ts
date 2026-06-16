import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart/cart.service';
import { Cart } from '../../../../core/models/cart.model';
import { OrderService } from '../../../../core/services/order/order.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  form: FormGroup;
  cart: Cart | null = null;
  loading     = false;
  cartLoading = true;
  error       = '';

  // ── Saved address state ──────────────────────────────
  usesavedAddress = false;          // هل اليوزر اختار العنوان المحفوظ؟
  savedAddress    = '';             // العنوان المخزن من الـ DB
  savedName       = '';             // الاسم المخزن
  savedPhone      = '';             // التليفون المخزن
  hasSavedAddress = false;          // هل عنده عنوان محفوظ أصلاً؟
  profileLoading  = true;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      organization: [''],
      street:       ['', Validators.required],
      city:         ['', Validators.required],
      province:     ['', Validators.required],
      postalCode:   ['', Validators.required],
      phone:        ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      saveDefault:  [false],
    });
  }

  ngOnInit(): void {
    // ── Cart ──
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.cartLoading = false;
    });
    if (!this.cartService.currentCart) {
      this.cartLoading = true;
      this.cartService.loadCart().subscribe({
        next:  () => (this.cartLoading = false),
        error: () => (this.cartLoading = false)
      });
    }

    // ── Load profile for prefill ──
    this.http.get<any>(`${environment.apiUrl}user/myInfo`).subscribe({
      next: (res) => {
        const user    = res.user;
        const profile = res.profile;   // Buyer model → { address, company }

        // اسم المستخدم → أول كلمة firstName، باقيهم lastName
        const nameParts = (user?.name ?? '').split(' ');
        const firstName = nameParts[0] ?? '';
        const lastName  = nameParts.slice(1).join(' ') || '';
        const phone     = (user?.phone ?? '').replace(/^\+20/, '');
        const company   = profile?.company ?? '';
        const address   = profile?.address ?? '';

        this.savedName    = user?.name ?? '';
        this.savedPhone   = phone;
        this.savedAddress = address;
        this.hasSavedAddress = !!address;

        // prefill الفورم بالبيانات الشخصية دايماً
        this.form.patchValue({
          firstName,
          lastName,
          organization: company,
          phone,
        });

        // لو عنده عنوان محفوظ → اعرضه كخيار افتراضي
        if (this.hasSavedAddress) {
          this.selectSavedAddress();
        }

        this.profileLoading = false;
      },
      error: () => { this.profileLoading = false; }
    });
  }

  // ── اختيار العنوان المحفوظ ────────────────────────────
  selectSavedAddress(): void {
    this.usesavedAddress = true;

    // parse العنوان المحفوظ لو كان بالفورمات القديمة (string)
    // وإلا اتركه في الـ street field
    this.form.patchValue({
      street:     this.savedAddress,
      city:       '',
      province:   '',
      postalCode: '',
    });

    // disable الفيلدات عشان اليوزر ميعدلش
    this.form.get('street')?.disable();
    this.form.get('city')?.disable();
    this.form.get('province')?.disable();
    this.form.get('postalCode')?.disable();
  }

  // ── إدخال عنوان جديد ──────────────────────────────────
  selectNewAddress(): void {
    this.usesavedAddress = false;

    this.form.patchValue({
      street:     '',
      city:       '',
      province:   '',
      postalCode: '',
    });

    this.form.get('street')?.enable();
    this.form.get('city')?.enable();
    this.form.get('province')?.enable();
    this.form.get('postalCode')?.enable();
  }

  // ── Computed ──────────────────────────────────────────
  get subtotal(): number { return this.cart ? this.cartService.getSubtotal(this.cart.items) : 0; }
  get tax(): number      { return this.cartService.getEstimatedTax(this.subtotal); }
  get total(): number    { return this.cartService.getTotal(this.cart?.items ?? []); }
  get itemCount(): number { return this.cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0; }

  private buildShippingAddress(): string {
    const v = this.form.getRawValue();   // getRawValue يجيب حتى الـ disabled fields
    return [
      `${v.firstName} ${v.lastName}`,
      v.organization || null,
      v.street,
      v.city && v.province ? `${v.city}, ${v.province} ${v.postalCode}` : null,
      `+20${v.phone}`
    ].filter(Boolean).join(', ');
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';

    this.orderService.makeOrder({
      shippingAddress: this.buildShippingAddress()
    }).subscribe({
      next: (res) => {
        this.loading = false;
        window.location.href = res.paymentUrl;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Failed to place order. Please try again.';
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}