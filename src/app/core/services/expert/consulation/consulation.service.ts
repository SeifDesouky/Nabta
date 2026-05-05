import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import {
  Post, PostWithUI, Comment,
  CreateCommentRequest, ToggleInteractionRequest,
} from '../../../models/expert/consulation.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly http = inject(HttpClient);
  private readonly BASE = environment.apiUrl;

  // ── State ─────────────────────────────────────────────────────────────────
  private readonly _posts$       = new BehaviorSubject<PostWithUI[]>([]);
  private readonly _loading$     = new BehaviorSubject<boolean>(false);
  private readonly _submitting$  = new BehaviorSubject<boolean>(false);
  private readonly _selectedPost$= new BehaviorSubject<PostWithUI | null>(null);
  private readonly _searchQuery$ = new BehaviorSubject<string>('');

  readonly posts$        = this._posts$.asObservable();
  readonly loading$      = this._loading$.asObservable();
  readonly submitting$   = this._submitting$.asObservable();
  readonly selectedPost$ = this._selectedPost$.asObservable();
  readonly searchQuery$  = this._searchQuery$.asObservable();

  // ── Getters ───────────────────────────────────────────────────────────────
  get posts():       PostWithUI[]       { return this._posts$.getValue(); }
  get loading():     boolean            { return this._loading$.getValue(); }
  get submitting():  boolean            { return this._submitting$.getValue(); }
  get selectedPost():PostWithUI | null  { return this._selectedPost$.getValue(); }
  get searchQuery(): string             { return this._searchQuery$.getValue(); }

  // ── Derived: filtered posts ────────────────────────────────────────────────
  get filteredPosts(): PostWithUI[] {
    const q = this._searchQuery$.getValue().toLowerCase().trim();
    if (!q) return this._posts$.getValue();
    return this._posts$.getValue().filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q)
    );
  }

  // ── Load All Posts ────────────────────────────────────────────────────────
  loadPosts(): void {
    this._loading$.next(true);
    this.http.get<Post[]>(`${this.BASE}post/all_posts`).pipe(
      catchError(err => { console.error(err); return throwError(() => err); })
    ).subscribe(posts => {
      this._posts$.next(posts.map(p => ({ ...p, showComments: false, comments: [], replyText: '' })));
      this._loading$.next(false);
    });
  }

  // ── Load Comments for a post ──────────────────────────────────────────────
  loadComments(postId: string): void {
    this._updatePost(postId, { commentsLoading: true, showComments: true });

    this.http.get<Comment[]>(`${this.BASE}comment/${postId}/comments`).subscribe({
      next: (comments) => {
        this._updatePost(postId, { comments, commentsLoading: false });
        // also update selected post if open
        const sel = this._selectedPost$.getValue();
        if (sel?._id === postId) {
          this._selectedPost$.next({ ...sel, comments, commentsLoading: false });
        }
      },
      error: () => this._updatePost(postId, { commentsLoading: false }),
    });
  }

  // ── Toggle Comments visibility ────────────────────────────────────────────
  toggleComments(postId: string): void {
    const post = this._posts$.getValue().find(p => p._id === postId);
    if (!post) return;

    if (!post.showComments) {
      this.loadComments(postId);
    } else {
      this._updatePost(postId, { showComments: false });
    }
  }

  // ── Add Comment / Reply ───────────────────────────────────────────────────
  addComment(payload: CreateCommentRequest): Observable<Comment> {
    this._submitting$.next(true);
    return this.http.post<Comment>(`${this.BASE}comment/`, payload).pipe(
      tap((comment) => {
        // Add comment optimistically to the post
        const posts = this._posts$.getValue().map(p => {
          if (p._id !== payload.post) return p;
          const updated = { ...p };
          if (payload.parentComment) {
            // it's a reply — add to parent's replies
            updated.comments = (p.comments ?? []).map(c =>
              c._id === payload.parentComment
                ? { ...c, replies: [...(c.replies ?? []), comment] }
                : c
            );
          } else {
            updated.comments = [...(p.comments ?? []), comment];
            updated.commentCount = (p.commentCount ?? 0) + 1;
          }
          return updated;
        });
        this._posts$.next(posts);

        // sync selected post
        const sel = this._selectedPost$.getValue();
        if (sel?._id === payload.post) {
          const updatedPost = posts.find(p => p._id === payload.post);
          if (updatedPost) this._selectedPost$.next(updatedPost);
        }
      }),
      tap(() => this._submitting$.next(false)),
      catchError(err => {
        this._submitting$.next(false);
        return throwError(() => err);
      })
    );
  }

  // ── Delete Comment ────────────────────────────────────────────────────────
  deleteComment(commentId: string, postId: string): Observable<string> {
    return this.http.delete<string>(`${this.BASE}comment/${commentId}`).pipe(
      tap(() => {
        this._updatePost(postId, {
          comments: (this.posts.find(p => p._id === postId)?.comments ?? [])
            .filter(c => c._id !== commentId),
        });
      })
    );
  }

  // ── Like / Save Post ──────────────────────────────────────────────────────
  toggleLike(postId: string): Observable<{ message: string }> {
    const payload: ToggleInteractionRequest = {
      targetId: postId, targetType: 'Post', type: 'like',
    };
    return this.http.post<{ message: string }>(`${this.BASE}interaction/`, payload).pipe(
      tap((res) => {
        const isRemoved = res.message.includes('removed');
        this._updatePost(postId, {
          isLiked: !isRemoved,
          likesCount: this.posts.find(p => p._id === postId)!.likesCount + (isRemoved ? -1 : 1),
        });
      })
    );
  }

  // ── Open / Close Detail ───────────────────────────────────────────────────
  openPost(post: PostWithUI): void {
    this._selectedPost$.next(post);
    if (!post.comments?.length) {
      this.loadComments(post._id);
    }
  }

  closePost(): void {
    this._selectedPost$.next(null);
  }

  // ── Search ────────────────────────────────────────────────────────────────
  setSearch(query: string): void {
    this._searchQuery$.next(query);
  }

  // ── Update reply text ─────────────────────────────────────────────────────
  setReplyText(postId: string, text: string): void {
    this._updatePost(postId, { replyText: text });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private _updatePost(postId: string, changes: Partial<PostWithUI>): void {
    this._posts$.next(
      this._posts$.getValue().map(p => p._id === postId ? { ...p, ...changes } : p)
    );
  }

  getInitials(name: string): string {
    return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '??';
  }

  timeAgo(dateStr: string): string {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)  return 'Just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  <  7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' });
  }

  getRoleBadge(role: string): { label: string; bg: string; color: string } {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      expert:  { label: 'Expert',  bg: 'rgba(13,99,27,0.1)',  color: '#0d631b' },
      farmer:  { label: 'Farmer',  bg: 'rgba(13,99,27,0.07)', color: '#0a5217' },
      buyer:   { label: 'Buyer',   bg: '#eeeeee',             color: '#40493d' },
    };
    return map[role] ?? { label: role, bg: '#eee', color: '#6c7c66' };
  }
}