// ─────────────────────────────────────────────────────────────────────────────
//  YieldService
//  Endpoints:
//    GET /plants              → list of all 78 crop names
//    GET /forecast?...        → historical + forecast data
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PlantsResponse,
  YieldForecastParams,
  YieldForecastResponse,
} from '../../../models/AI.models/yield.model';

@Injectable({ providedIn: 'root' })
export class YieldService {

  private readonly BASE = 'https://osamamahgoup0-yield.hf.space';

  constructor(private http: HttpClient) {}

  /** GET /plants — returns all 78 crop names */
  getPlants(): Observable<PlantsResponse> {
    return this.http.get<PlantsResponse>(`${this.BASE}/plants`);
  }

  /** GET /forecast?plant_name=Apples&end_year=2025 */
  getForecast(params: YieldForecastParams): Observable<YieldForecastResponse> {
    const httpParams = new HttpParams()
      .set('plant_name', params.plant_name)
      .set('end_year', params.end_year.toString());

    return this.http.get<YieldForecastResponse>(`${this.BASE}/forecast`, { params: httpParams });
  }
}