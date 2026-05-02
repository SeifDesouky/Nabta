import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, catchError, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Models
import {
  UserProfile,
  ExpertProfile,
  Post,
  ExpertTip,
  ProfileTab,
  ActivityItem
} from '../../models/expert/expert-profile.model';

import { DashboardStats } from '../../models/expert/expert-dashboard.model';

@Injectable({ providedIn: 'root' })
export class ExpertService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // ─────────────────────────────────────────────────────────
  // STATE (only MY data)
  // ─────────────────────────────────────────────────────────

  private readonly _user$          = new BehaviorSubject<UserProfile | null>(null);
  private readonly _expert$        = new BehaviorSubject<ExpertProfile | null>(null);
  private readonly _cvUrl$         = new BehaviorSubject<string | null>(null);

  private readonly _posts$         = new BehaviorSubject<Post[]>([]);
  private readonly _tips$          = new BehaviorSubject<ExpertTip[]>([]);

  private readonly _loading$       = new BehaviorSubject<boolean>(false);
  private readonly _tab$           = new BehaviorSubject<ProfileTab>('info');

  private readonly _stats$         = new BehaviorSubject<DashboardStats>({
    activeConsultations: 0,
    pendingQuestions: 0,
    averageRating: 0,
    totalEarnings: 0,
    farmersHelped: 0,
    solvedCases: 0,
  });

  // ─────────────────────────────────────────────────────────
  // Observables
  // ─────────────────────────────────────────────────────────

  readonly user$    = this._user$.asObservable();
  readonly expert$  = this._expert$.asObservable();
  readonly cvUrl$   = this._cvUrl$.asObservable();

  readonly posts$   = this._posts$.asObservable();
  readonly tips$    = this._tips$.asObservable();

  readonly loading$ = this._loading$.asObservable();
  readonly tab$     = this._tab$.asObservable();

  readonly stats$   = this._stats$.asObservable();

  // ─────────────────────────────────────────────────────────
  // Snapshot
  // ─────────────────────────────────────────────────────────

  get user()   { return this._user$.getValue(); }
  get expert() { return this._expert$.getValue(); }
  get posts()  { return this._posts$.getValue(); }
  get tips()   { return this._tips$.getValue(); }
  get stats()  { return this._stats$.getValue(); }
  get loading(){ return this._loading$.getValue(); }
  get tab()    { return this._tab$.getValue(); }

  // ─────────────────────────────────────────────────────────
  // 🚀 Load MY data only
  // ─────────────────────────────────────────────────────────

  load(): void {
    this._loading$.next(true);

    forkJoin({
      info: this.http.get<any>(`${this.BASE}user/myInfo`).pipe(
        catchError(() => of(null))
      ),
      posts: this.http.get<Post[]>(`${this.BASE}post/my_posts`).pipe(
        catchError(() => of([]))
      ),
      tips: this.http.get<ExpertTip[]>(`${this.BASE}tips/my_tips`).pipe(
        catchError(() => of([]))
      ),
    }).subscribe(({ info, posts, tips }) => {

      // Profile
      if (info) {
        this._user$.next(info.user);
        this._expert$.next(info.profile);
        this._cvUrl$.next(info.cvUrl);
      }

      // Content
      this._posts$.next(posts);
      this._tips$.next(tips.filter(t => !t.isDeleted));

      // Stats (derived)
      const pending = posts.filter(p => (p.commentCount ?? 0) === 0).length;

      this._stats$.next({
        ...this._stats$.getValue(),
        activeConsultations: posts.length,
        pendingQuestions: pending,
      });

      this._loading$.next(false);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Actions (SELF only)
  // ─────────────────────────────────────────────────────────

  deletePost(id: string) {
    return this.http.delete(`${this.BASE}post/${id}`).pipe(
      tap(() => {
        this._posts$.next(this.posts.filter(p => p._id !== id));
      })
    );
  }

  deleteTip(id: string) {
    return this.http.patch(`${this.BASE}tips/delete/${id}`, {}).pipe(
      tap(() => {
        this._tips$.next(this.tips.filter(t => t._id !== id));
      })
    );
  }

  setTab(tab: ProfileTab) {
    this._tab$.next(tab);
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  getInitials(name: string) {
    return name?.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }

  timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);

    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;

    return new Date(date).toLocaleDateString('en-EG');
  }

  getRecentActivity(): ActivityItem[] {
    const arr: ActivityItem[] = [];

    if (this.posts[0]) {
      arr.push({
        icon: 'article',
        iconBg: '#a3f69c',
        iconColor: '#002204',
        title: 'Post published',
        description: this.posts[0].title,
        time: this.timeAgo(this.posts[0].createdAt),
      });
    }

    if (this.tips[0]) {
      arr.push({
        icon: 'lightbulb',
        iconBg: '#ffdbca',
        iconColor: '#773200',
        title: 'Tip shared',
        description: this.tips[0].title,
        time: this.timeAgo(this.tips[0].createdAt),
      });
    }

    return arr;
  }

  downloadCV() {
    this.http.get(`${this.BASE}user/cv`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.user?.name}_CV.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }
}