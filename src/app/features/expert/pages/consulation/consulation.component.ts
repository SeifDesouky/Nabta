
import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ConsultationService } from '../../../../core/services/expert/consulation/consulation.service';
import { PostWithUI } from '../../../../core/models/expert/consulation.model';
import { UnansweredCountPipe } from "../../../../core/Pips/unansweredCount.pip";


@Component({
  selector: 'app-consulation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UnansweredCountPipe],
  templateUrl: './consulation.component.html',
  styleUrl: './consulation.component.css'
})
export class ConsulationComponent {
  private readonly destroy$ = new Subject<void>();
  readonly svc = inject(ConsultationService);
  private readonly cdr = inject(ChangeDetectorRef);
 
  readonly searchControl    = new FormControl('');
  readonly replyControls    = new Map<string, FormControl>(); // postId → FormControl
 
  ngOnInit(): void {
    this.svc.loadPosts();
 
    // Debounced search
    this.searchControl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$),
    ).subscribe(q => { this.svc.setSearch(q ?? ''); this.cdr.markForCheck(); });
 
    // Re-render
    this.svc.posts$       .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.loading$     .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.submitting$  .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.selectedPost$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
  }
 
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
 
  // ── Post actions ───────────────────────────────────────────────────────────
  openPost(post: PostWithUI): void       { this.svc.openPost(post); }
  closePost(): void                      { this.svc.closePost(); }
  toggleComments(postId: string): void   { this.svc.toggleComments(postId); }
  toggleLike(postId: string, e: Event): void {
    e.stopPropagation();
    this.svc.toggleLike(postId).subscribe();
  }
 
  // ── Comment reply ──────────────────────────────────────────────────────────
  getReplyControl(postId: string): FormControl {
    if (!this.replyControls.has(postId)) {
      this.replyControls.set(postId, new FormControl(''));
    }
    return this.replyControls.get(postId)!;
  }
 
  submitReply(postId: string): void {
    const ctrl  = this.getReplyControl(postId);
    const text  = (ctrl.value ?? '').trim();
    if (!text || this.svc.submitting) return;
 
    this.svc.addComment({ post: postId, content: text }).subscribe({
      complete: () => { ctrl.setValue(''); this.cdr.markForCheck(); },
    });
  }
 
  deleteComment(commentId: string, postId: string, e: Event): void {
    e.stopPropagation();
    this.svc.deleteComment(commentId, postId).subscribe();
  }
 
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.closePost();
  }
 
  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(name: string)   { return this.svc.getInitials(name); }
  timeAgo(date: string)       { return this.svc.timeAgo(date); }
  getRoleBadge(role: string)  { return this.svc.getRoleBadge(role); }
  trackByPost(_: number, p: PostWithUI): string { return p._id; }

}
