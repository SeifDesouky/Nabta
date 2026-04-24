import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  private baseUrl = environment.apiUrl; // e.g. 'http://localhost:3000/api/'

  constructor(private http: HttpClient) {}

  // ── GET ──────────────────────────────────────────────────────────────────
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.jsonHeaders()
    });
  }

  // ── POST (JSON) ───────────────────────────────────────────────────────────
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.jsonHeaders()
    });
  }

  // ── POST (FormData / multipart) ───────────────────────────────────────────
  // ✅ السبب: الباك بيستقبل الـ CV كـ req.file عن طريق multer
  // multer بيشتغل بس مع multipart/form-data
  // لو بعتنا JSON هيجي req.file = undefined وملوش محل يتحفظ
  // مهم: مش بنحط Content-Type header خالص عشان الـ browser
  // يحدده تلقائيًا مع الـ boundary الصح
  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  // ── PUT (JSON) ────────────────────────────────────────────────────────────
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.jsonHeaders()
    });
  }

  // ── PUT (FormData) ────────────────────────────────────────────────────────
  putFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.jsonHeaders()
    });
  }

  // ── Helper ────────────────────────────────────────────────────────────────
  private jsonHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
}
