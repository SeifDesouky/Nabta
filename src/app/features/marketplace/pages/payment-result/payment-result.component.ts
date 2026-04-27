import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order/order.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.css'
})
export class PaymentResultComponent implements OnInit{
status: 'success' | 'failed' | 'error' | null = null;
  orderId = '';
  order: Order | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.status  = params.get('status') as any;
    this.orderId = params.get('orderId') ?? '';

    if (this.orderId) {
      this.orderService.getOrderById(this.orderId).subscribe({
        next:  (o) => { this.order = o; this.loading = false; },
        error: ()  => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  get isSuccess(): boolean { return this.status === 'success'; }
  get isFailed():  boolean { return this.status === 'failed' || this.status === 'error'; }
}
