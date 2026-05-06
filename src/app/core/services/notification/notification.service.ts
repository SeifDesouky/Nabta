import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { INotification } from '../../models/notifications.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}notification`;

  constructor(private http: HttpClient) {}

  /** Get all notifications for the logged-in user */
  getAll(): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${this.base}/`);
  }

  /** Get count of unread notifications */
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.base}/unread`);
  }

  /** Mark a single notification as read */
  markAsRead(id: string): Observable<INotification> {
    return this.http.patch<INotification>(`${this.base}/${id}`, {});
  }
}