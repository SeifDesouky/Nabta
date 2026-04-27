import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExpertTip, CreateTipRequest } from '../../models/expert-tip..model';

@Injectable({ providedIn: 'root' })
export class ExpertTipService {
  private readonly BASE = `${environment.apiUrl}tips`;

  constructor(private http: HttpClient) {}

  // GET /tips/allTips
  getAllTips(): Observable<ExpertTip[]> {
    return this.http.get<ExpertTip[]>(`${this.BASE}/allTips`);
  }

  // GET /tips/myTips (token)
  getMyTips(): Observable<ExpertTip[]> {
    return this.http.get<ExpertTip[]>(`${this.BASE}/myTips`);
  }

  // POST /tips (token)
  createTip(payload: CreateTipRequest): Observable<ExpertTip> {
    return this.http.post<ExpertTip>(`${this.BASE}/`, payload);
  }

  // PATCH /tips/:id (token)
  updateTip(id: string, payload: Partial<CreateTipRequest>): Observable<ExpertTip> {
    return this.http.patch<ExpertTip>(`${this.BASE}/${id}`, payload);
  }
}
