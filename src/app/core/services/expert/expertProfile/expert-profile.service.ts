import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, catchError, of, tap } from 'rxjs';

import {
  UserProfile,
  ExpertProfile,
  MyInfoResponse,
  Post,
  ExpertTip,
  ProfileTab,
  ActivityItem
} from '../../../models/expert/expert-profile.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExpertProfileService {

  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // ─────────────────────────────────────────
  // 🧠 STATE
  // ─────────────────────────────────────────

  private readonly _user$          = new BehaviorSubject<UserProfile | null>(null);
  private readonly _profile$       = new BehaviorSubject<ExpertProfile | null>(null);
  private readonly _cvUrl$         = new BehaviorSubject<string | null>(null);

  private readonly _posts$         = new BehaviorSubject<Post[]>([]);
  private readonly _tips$          = new BehaviorSubject<ExpertTip[]>([]);

  private readonly _loading$       = new BehaviorSubject<boolean>(false);
  private readonly _activeTab$     = new BehaviorSubject<ProfileTab>('info');

  // ─────────────────────────────────────────
  // 📡 Observables
  // ─────────────────────────────────────────

  readonly user$       = this._user$.asObservable();
  readonly profile$    = this._profile$.asObservable();
  readonly cvUrl$      = this._cvUrl$.asObservable();
  readonly posts$      = this._posts$.asObservable();
  readonly tips$       = this._tips$.asObservable();
  readonly loading$    = this._loading$.asObservable();
  readonly activeTab$  = this._activeTab$.asObservable();

  // ─────────────────────────────────────────
  // ⚡ Snapshots
  // ─────────────────────────────────────────

  get user()      { return this._user$.getValue(); }
  get profile()   { return this._profile$.getValue(); }
  get cvUrl()     { return this._cvUrl$.getValue(); }
  get posts()     { return this._posts$.getValue(); }
  get tips()      { return this._tips$.getValue(); }
  get loading()   { return this._loading$.getValue(); }
  get activeTab() { return this._activeTab$.getValue(); }

  // ─────────────────────────────────────────
  // 🚀 Load Profile Page
  // ─────────────────────────────────────────

  loadProfile(): void {
    this._loading$.next(true);

    forkJoin({
      info: this.http.get<MyInfoResponse>(`${this.BASE}user/myInfo`)
        .pipe(catchError(() => of(null))),

      posts: this.http.get<Post[]>(`${this.BASE}post/my_posts`)
        .pipe(catchError(() => of([]))),

      tips: this.http.get<ExpertTip[]>(`${this.BASE}tips/my_tips`)
        .pipe(catchError(() => of([]))),
    }).subscribe(({ info, posts, tips }) => {
      console.log('tips response:', tips);
      // ── User + Profile ──
      if (info) {
        this._user$.next(info.user);
        this._profile$.next(info.profile);
        this._cvUrl$.next(info.cvUrl);
      }

      // ── Posts ──
      this._posts$.next(posts);

      // ── Tips ──
      this._tips$.next(tips.filter(t => !t.isDeleted));

      this._loading$.next(false);
    });
  }

  // ─────────────────────────────────────────
  // 🗑️ Actions
  // ─────────────────────────────────────────

  deletePost(postId: string) {
    return this.http.delete(`${this.BASE}post/${postId}`).pipe(
      tap(() => {
        this._posts$.next(
          this._posts$.getValue().filter(p => p._id !== postId)
        );
      })
    );
  }

  deleteTip(tipId: string) {
    return this.http.patch(`${this.BASE}tips/delete/${tipId}`, {}).pipe(
      tap(() => {
        this._tips$.next(
          this._tips$.getValue().filter(t => t._id !== tipId)
        );
      })
    );
  }

  setTab(tab: ProfileTab) {
    this._activeTab$.next(tab);
  }

  // ─────────────────────────────────────────
  // 🧩 Helpers
  // ─────────────────────────────────────────

  getInitials(name: string): string {
    return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '??';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(dateStr).toLocaleDateString();
  }

  getStatusConfig(status: string) {
    return {
      accepted: { label: 'Verified Expert', bg: '#e6f4ea', color: '#137333' },
      pending:  { label: 'Pending Review',  bg: '#fff4e5', color: '#8e3d00' },
      rejected: { label: 'Rejected',        bg: '#fdecea', color: '#b3261e' },
    }[status] ?? { label: status, bg: '#eee', color: '#666' };
  }

  getRecentActivity(): ActivityItem[] {
    const activity: ActivityItem[] = [];

    const post = this.posts[0];
    if (post) {
      activity.push({
        icon: 'article',
        iconBg: '#a3f69c',
        iconColor: '#002204',
        title: 'New Post',
        description: post.title,
        time: this.timeAgo(post.createdAt),
      });
    }

    const tip = this.tips[0];
    if (tip) {
      activity.push({
        icon: 'lightbulb',
        iconBg: '#ffdbca',
        iconColor: '#773200',
        title: 'Tip Shared',
        description: tip.title,
        time: this.timeAgo(tip.createdAt),
      });
    }

    return activity;
  }

  downloadCV(): void {
    this.http.get(`${this.BASE}user/cv`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.user?.name ?? 'expert'}_CV.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}