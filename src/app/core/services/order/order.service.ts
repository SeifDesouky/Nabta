import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MakeOrderRequest, MakeOrderResponse, Order } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly BASE_URL = `${environment.apiUrl}order`;

  constructor(private http: HttpClient) {}

  // POST /order  → ينشئ أوردر من الكارت الحالي + يرجع paymentUrl
  makeOrder(payload: MakeOrderRequest): Observable<MakeOrderResponse> {
    return this.http.post<MakeOrderResponse>(`${this.BASE_URL}/`, payload);
  }

  // GET /order/my_orders
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.BASE_URL}/my_orders`);
  }

  // GET /order/order_details/:id
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.BASE_URL}/order_details/${id}`);
  }
}
