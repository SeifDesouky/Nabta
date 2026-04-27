import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../../core/services/order/order.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {
orders: Order[] = [];
  loading = true;
  error   = '';

  // الـ order اللي اليوزر فاتح تفاصيله
  expandedOrderId: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next:  (res) => { this.orders = res; this.loading = false; },
      error: ()    => { this.error = 'Failed to load orders.'; this.loading = false; }
    });
  }

  toggleExpand(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  isExpanded(id: string): boolean {
    return this.expandedOrderId === id;
  }

  // ── Status helpers ────────────────────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending:   'bg-amber-50 text-amber-600 border-amber-200',
      shipped:   'bg-blue-50 text-blue-600 border-blue-200',
      delivered: 'bg-primary/10 text-primary border-primary/20',
      rejected:  'bg-red-50 text-red-500 border-red-200',
      canceled:  'bg-zinc-100 text-zinc-500 border-zinc-200',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-500 border-zinc-200';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending:   'schedule',
      shipped:   'local_shipping',
      delivered: 'check_circle',
      rejected:  'cancel',
      canceled:  'block',
    };
    return map[status] ?? 'help_outline';
  }

  getPaymentClass(status: string): string {
    const map: Record<string, string> = {
      paid:    'text-primary',
      failed:  'text-red-500',
      pending: 'text-amber-500',
    };
    return map[status] ?? 'text-zinc-400';
  }

  getPaymentIcon(status: string): string {
    const map: Record<string, string> = {
      paid:    'check_circle',
      failed:  'cancel',
      pending: 'schedule',
    };
    return map[status] ?? 'help';
  }
  // ── إضافات جديدة للـ template ────────────────────────
getStatusBg(status: string): string {
  const map: Record<string, string> = {
    pending:   'bg-amber-50',
    shipped:   'bg-blue-50',
    delivered: 'bg-primary/10',
    rejected:  'bg-red-50',
    canceled:  'bg-zinc-100',
  };
  return map[status] ?? 'bg-zinc-100';
}

getStatusTextColor(status: string): string {
  const map: Record<string, string> = {
    pending:   'text-amber-600',
    shipped:   'text-blue-600',
    delivered: 'text-primary',
    rejected:  'text-red-500',
    canceled:  'text-zinc-500',
  };
  return map[status] ?? 'text-zinc-500';
}

getPaymentBadgeClass(status: string): string {
  const map: Record<string, string> = {
    paid:    'bg-primary/10 text-primary border-primary/20',
    failed:  'bg-red-50 text-red-500 border-red-200',
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
  };
  return map[status] ?? 'bg-zinc-100 text-zinc-500 border-zinc-200';
}
}
