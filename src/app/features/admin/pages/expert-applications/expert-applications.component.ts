import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExpertApplicationsService } from '../../../../core/services/admin/expert-application/expret-application.service';
import { ExpertProfile, FilterStatus } from '../../../../core/models/adminModels/expert-application.model';

@Component({
  selector: 'app-expert-applications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './expert-applications.component.html',
  styleUrl: './expert-applications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertApplicationsComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  readonly svc = inject(ExpertApplicationsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly searchControl = new FormControl('');

  readonly filterTabs: { label: string; value: FilterStatus }[] = [
    { label: 'All',      value: 'all'      },
    { label: 'Pending',  value: 'pending'  },
    { label: 'Approved', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  ngOnInit(): void {
    this.svc.loadStats();
    this.svc.loadExperts(1, 'all');

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.svc.setSearch(query ?? '');
        this.cdr.markForCheck();
      });

    this.svc.experts$      .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.stats$        .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.loading$      .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.statsLoading$ .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.modalOpen$    .pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.svc.actionLoading$.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(filter: FilterStatus): void { this.svc.setFilter(filter); }
  isActiveFilter(filter: FilterStatus): boolean { return this.svc.activeFilter === filter; }
  onStatCardClick(filter: FilterStatus): void { this.svc.setFilter(filter); }

  openModal(expert: ExpertProfile): void { this.svc.openModal(expert); }
  closeModal(): void { this.svc.closeModal(); }

  onModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  approve(expert: ExpertProfile): void {
    this.svc.manageExpert(expert.user._id, 'approve').subscribe();
  }

  reject(expert: ExpertProfile): void {
    this.svc.manageExpert(expert.user._id, 'reject').subscribe();
  }

  approveFromModal(): void {
    const expert = this.svc.selectedExpert;
    if (expert) {
      this.svc.manageExpert(expert.user._id, 'approve').subscribe({
        complete: () => this.closeModal(),
      });
    }
  }

  rejectFromModal(): void {
    const expert = this.svc.selectedExpert;
    if (expert) {
      this.svc.manageExpert(expert.user._id, 'reject').subscribe({
        complete: () => this.closeModal(),
      });
    }
  }

  downloadResume(expert: ExpertProfile, event: Event): void {
    event.stopPropagation();
    this.svc.downloadCV(expert._id, expert.user.name);
  }

  prevPage(): void { this.svc.goToPage(this.svc.currentPage - 1); }
  nextPage(): void { this.svc.goToPage(this.svc.currentPage + 1); }

  get hasPrev(): boolean { return this.svc.currentPage > 1; }
  get hasNext(): boolean { return this.svc.currentPage < this.svc.totalPages; }

  get showingFrom(): number {
    return (this.svc.currentPage - 1) * this.svc.LIMIT + 1;
  }

  get showingTo(): number {
    return Math.min(this.svc.currentPage * this.svc.LIMIT, this.svc.totalResult);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.svc.modalOpen) this.closeModal();
  }

  getInitials(name: string): string { return this.svc.getInitials(name); }
  getTimeAgo(date: string): string { return this.svc.getTimeAgo(date); }
  isActionLoading(userId: string): boolean { return this.svc.isActionLoading(userId); }
  trackByExpert(_: number, e: ExpertProfile): string { return e._id; }
}
