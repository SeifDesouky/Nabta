import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../../core/services/post/post.service';
import { CommentService } from '../../../../core/services/comment/comment.service';
import { InteractionService } from '../../../../core/services/interaction/interaction.service';
import { Post, CreatePostRequest } from '../../../../core/models/post.model';
import { Comment, CreateCommentRequest } from '../../../../core/models/comment.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { INotification } from '../../../../core/models/notifications.model';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { FarmerSidebarComponent } from '../../../farmer/shared/farmer-sidebar/farmer-sidebar.component';

@Component({
  selector: 'app-community-feed',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink,FarmerSidebarComponent],
  templateUrl: './community.component.html',
})
export class CommunityFeedComponent implements OnInit {
  
  currentUserRole: string = localStorage.getItem('role') || 'farmer'; 

  get dashboardLink(): string {
    return this.currentUserRole === 'expert' ? '/expert/dashboard' : '/farmer/dashboard';
  }
    notifications: INotification[] = [];
    notifOpen: boolean = false;
    notifLoading: boolean = false;
    unreadCount: number = 0;
    sortOpen: boolean = false;

  posts: Post[]    = [];
  loading          = true;
  error            = '';

  // Create post form
  newPostContent   = '';
  newPostTitle     = '';
  newPostTags      = '';
  postSubmitting   = false;

  // Comments — map من postId → comments
  commentsMap: Record<string, Comment[]>  = {};
  loadingComments: Record<string, boolean> = {};
  expandedPosts: Set<string>              = new Set();

  // Comment input — map من postId → text
  commentInputs: Record<string, string> = {};

  // AI Flyout
  // aiFlyoutOpen = false;
  // aiFlyoutTop  = '0px';
  // aiFlyoutLeft = '0px';
  // private _hideTimer: any;

  // Nav
  // navOpen = true;
topContributors = [
  { name: 'Sarah Jensen',    role: 'Agronomist'     },
  { name: 'Marcus Chen',     role: 'Soil Specialist' },
  { name: 'Elena Rodriguez', role: 'Data Scientist'  },
];
// Community Flyout
// communityFlyoutOpen = false;
// communityFlyoutTop  = '0px';
// communityFlyoutLeft = '0px';
// private _communityTimer: any;

// showCommunityFlyout(el: HTMLElement): void {
//   if (this._communityTimer) clearTimeout(this._communityTimer);
//   const rect              = el.getBoundingClientRect();
//   this.communityFlyoutTop  = rect.top  + 'px';
//   this.communityFlyoutLeft = (rect.right + 10) + 'px';
//   this.communityFlyoutOpen = true;
// }

// keepCommunityFlyout(): void {
//   if (this._communityTimer) clearTimeout(this._communityTimer);
// }

// scheduleHideCommunityFlyout(): void {
//   this._communityTimer = setTimeout(() => {
//     this.communityFlyoutOpen = false;
//   }, 130);
// }
  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private interactionService: InteractionService,
    private authService:AuthService,
    private notifService:NotificationService ,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadPosts();
   this.loadUnreadCount();
  }
    @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notifOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.notifOpen = false;
    }
    if (this.sortOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.sortOpen = false;
    }
  }

    // ══════════════════════════════════════════════════════
  //  NOTIFICATION METHODS
  // ══════════════════════════════════════════════════════
 
  /** Fetch unread count on page load (lightweight call) */
  loadUnreadCount(): void {
    this.notifService.getUnreadCount().subscribe({
      next: (count) => (this.unreadCount = count),
      error: (err)  => console.error('Could not fetch unread count', err),
    });
  }
 
  /** Toggle dropdown — lazy-load notifications list on first open */
  toggleNotifDropdown(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }
 
  /** Fetch all notifications */
  loadNotifications(): void {
    this.notifLoading = true;
    this.notifService.getAll().subscribe({
      next: (list) => {
        this.notifications = list;
        this.notifLoading  = false;
      },
      error: (err) => {
        console.error('Could not fetch notifications', err);
        this.notifLoading = false;
      },
    });
  }
 
  /** Mark one notification as read and update the local state */
  readNotif(n: INotification): void {
    if (n.isRead) return;
    this.notifService.markAsRead(n._id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => console.error('Could not mark as read', err),
    });
  }
 
  /** Icon helpers — map notification type to a Material Symbol */
  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      order:   'shopping_bag',
      payment: 'payments',
      message: 'chat',
      alert:   'warning',
      system:  'info',
    };
    return map[type] ?? 'notifications';
  }
 
  getNotifIconBg(type: string): string {
    const map: Record<string, string> = {
      order:   'bg-blue-50',
      payment: 'bg-emerald-50',
      message: 'bg-violet-50',
      alert:   'bg-amber-50',
      system:  'bg-primary/10',
    };
    return map[type] ?? 'bg-primary/10';
  }
 
  getNotifIconColor(type: string): string {
    const map: Record<string, string> = {
      order:   'text-blue-500',
      payment: 'text-emerald-500',
      message: 'text-violet-500',
      alert:   'text-amber-500',
      system:  'text-primary',
    };
    return map[type] ?? 'text-primary';
  }
  // ── Posts ─────────────────────────────────────────────
  loadPosts(): void {
    this.loading = true;
    this.postService.getAllPosts().subscribe({
      next:  (posts) => { this.posts = posts; this.loading = false; },
      error: ()      => { this.error = 'Failed to load posts.'; this.loading = false; }
    });
  }

  submitPost(): void {
    if (!this.newPostContent.trim() || this.postSubmitting) return;
    this.postSubmitting = true;

    const payload: CreatePostRequest = {
      content: this.newPostContent.trim(),
      title:   this.newPostTitle.trim() || undefined,
      tags:    this.newPostTags
                 .split(',')
                 .map(t => t.trim())
                 .filter(Boolean)
    };

    this.postService.createPost(payload).subscribe({
      next: (post) => {
        this.posts.unshift(post);
        this.newPostContent = '';
        this.newPostTitle   = '';
        this.newPostTags    = '';
        this.postSubmitting = false;
      },
      error: () => { this.postSubmitting = false; }
    });
  }

  deletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe(() => {
      this.posts = this.posts.filter(p => p._id !== postId);
    });
  }

  // ── Like ──────────────────────────────────────────────
toggleLike(post: Post): void {
  const wasLiked = !!post.isLiked;

  // Optimistic update
  post.isLiked    = !wasLiked;
  post.likesCount = wasLiked ? post.likesCount - 1 : post.likesCount + 1;

  this.interactionService.likePost(post._id).subscribe({
    next: (res) => {
      // الباك بيقول "like added" أو "like removed"
      post.isLiked = res.message.includes('added');
      // مش بنغير الـ count تاني لأنه اتغير في الـ optimistic
    },
    error: () => {
      // Rollback
      post.isLiked    = wasLiked;
      post.likesCount = wasLiked ? post.likesCount + 1 : post.likesCount - 1;
    }
  });
}

  // ── Comments ──────────────────────────────────────────
  toggleComments(postId: string): void {
    if (this.expandedPosts.has(postId)) {
      this.expandedPosts.delete(postId);
      return;
    }
    this.expandedPosts.add(postId);

    if (!this.commentsMap[postId]) {
      this.loadComments(postId);
    }
  }
// في community-feed.component.ts
getTotalCommentCount(postId: string): number {
  const comments = this.commentsMap[postId];
  if (!comments) return 0;
  return comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);
}
  loadComments(postId: string): void {
    this.loadingComments[postId] = true;
    this.commentService.getComments(postId).subscribe({
      next:  (c) => { this.commentsMap[postId] = c; this.loadingComments[postId] = false; },
      error: ()  => { this.loadingComments[postId] = false; }
    });
  }

  isCommentsExpanded(postId: string): boolean {
    return this.expandedPosts.has(postId);
  }

  submitComment(post: Post): void {
    const content = (this.commentInputs[post._id] ?? '').trim();
    if (!content) return;

    const payload: CreateCommentRequest = { post: post._id, content };

    this.commentService.addComment(payload).subscribe(comment => {
      if (!this.commentsMap[post._id]) this.commentsMap[post._id] = [];
      this.commentsMap[post._id].push(comment);
      this.commentInputs[post._id] = '';
      post.commentCount++;
    });
  }

  // ── Helpers ───────────────────────────────────────────
  timeAgo(date: string): string {
    return this.postService.timeAgo(date);
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';
  }

  // ── AI Flyout ─────────────────────────────────────────
  // showAiFlyout(el: HTMLElement): void {
  //   if (this._hideTimer) clearTimeout(this._hideTimer);
  //   const rect       = el.getBoundingClientRect();
  //   this.aiFlyoutTop  = rect.top + 'px';
  //   this.aiFlyoutLeft = (rect.right + 10) + 'px';
  //   this.aiFlyoutOpen = true;
  // }

  // keepAiFlyout(): void {
  //   if (this._hideTimer) clearTimeout(this._hideTimer);
  // }

  // scheduleHideAiFlyout(): void {
  //   this._hideTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  // }

  // ngOnDestroy(): void {
  //   if (this._hideTimer) clearTimeout(this._hideTimer);
  // }
  logout():void{
    this.authService.logout()
  }
}
