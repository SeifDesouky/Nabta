import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart/cart.service';
import { Cart } from '../../../../core/models/cart.model';
import { OrderService } from '../../../../core/services/order/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit{
form: FormGroup;
  cart: Cart | null = null;
  loading    = false;
  cartLoading = true;
  error      = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
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
    // لو الكارت موجود في الـ BehaviorSubject خده مباشرة
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.cartLoading = false;
    });

    // لو مفيش كارت محمل، حمّله
    if (!this.cartService.currentCart) {
      this.cartLoading = true;
      this.cartService.loadCart().subscribe({
        next:  () => (this.cartLoading = false),
        error: () => (this.cartLoading = false)
      });
    }
  }

  // ── Computed ──────────────────────────────────────────
  get subtotal(): number {
    return this.cart ? this.cartService.getSubtotal(this.cart.items) : 0;
  }

  get tax(): number {
    return this.cartService.getEstimatedTax(this.subtotal);
  }

  get total(): number {
    return this.cartService.getTotal(this.cart?.items ?? []);
  }

  get itemCount(): number {
    return this.cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  // ── شكّل الـ shippingAddress string من الفورم ─────────
  private buildShippingAddress(): string {
    const v = this.form.value;
    return [
      `${v.firstName} ${v.lastName}`,
      v.organization || null,
      v.street,
      `${v.city}, ${v.province} ${v.postalCode}`,
      `+20${v.phone}`
    ].filter(Boolean).join(', ');
  }

  // ── Submit ────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error   = '';

    this.orderService.makeOrder({
      shippingAddress: this.buildShippingAddress()
    }).subscribe({
      next: (res) => {
        this.loading = false;
        // رّدنا لـ Paymob payment page
        window.location.href = res.paymentUrl;
      },
      error: (err) => {
        this.loading = false;
        this.error   = err?.error?.message ?? 'Failed to place order. Please try again.';
      }
    });
  }

  // ── Field helpers للـ template ────────────────────────
  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
