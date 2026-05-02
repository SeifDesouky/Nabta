import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DashboardStats, Post } from '../../../models/expert/expert-dashboard.model';


@Injectable({ providedIn: 'root' })
export class ExpertDashboardService {
 private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _posts$ = new BehaviorSubject<Post[]>([]);
  private readonly _cvUrl = new BehaviorSubject<string | null>(null);

  private readonly _stats$ = new BehaviorSubject<DashboardStats>({
    activeConsultations: 0,
    pendingQuestions: 0,
    averageRating: 0,
    totalEarnings: 0,
    farmersHelped: 0,
    solvedCases: 0,
  });

  readonly loading$ = this._loading$.asObservable();
  readonly posts$ = this._posts$.asObservable();
  readonly stats$ = this._stats$.asObservable();
  readonly cvUrl$ = this._cvUrl.asObservable();

  get loading() { return this._loading$.getValue(); }
  get stats() { return this._stats$.getValue(); }
  get cvUrl() { return this._cvUrl.getValue(); }

  loadDashboard() {
    this._loading$.next(true);

    forkJoin({
      posts: this.http.get<Post[]>(`${this.BASE}post/my_posts`)
        .pipe(catchError(() => of([]))),

      cvUrl: this.http.get<{ cvUrl: string }>(`${this.BASE}expert/cv`)
        .pipe(catchError(() => of({ cvUrl: '' }))),

      stats: this.http.get<DashboardStats>(`${this.BASE}expert/stats`)
        .pipe(catchError(() => of({
          activeConsultations: 0,
          pendingQuestions: 0,
          averageRating: 0,
          totalEarnings: 0,
          farmersHelped: 0,
          solvedCases: 0,
        })))
    }).subscribe(({ posts, stats, cvUrl }) => {

      this._posts$.next(posts);
      this._stats$.next(stats);
      this._cvUrl.next(cvUrl.cvUrl);

      this._loading$.next(false);
    });
  }
}