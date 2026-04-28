import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { UserManagementService } from '../../../../core/services/admin/user-management/user-management.service';
import { User, RoleFilter, StatusFilter } from '../../../../core/models/adminModels/user-management.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
  readonly svc = inject(UserManagementService);
  private readonly cdr = inject(ChangeDetectorRef);
 
  readonly searchControl = new FormControl('');
  selectedRoleValue: RoleFilter = 'all';
 
  readonly roleOptions: { label: string; value: RoleFilter }[] = [
    { label: 'All Roles', value: 'all'    },
    { label: 'Farmer',    value: 'farmer' },
    { label: 'Expert',    value: 'expert' },
    { label: 'Buyer',     value: 'buyer'  },
  ];
 
  readonly statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All Statuses', value: 'all'     },
    { label: 'Active',       value: 'active'  },
    { label: 'Pending',      value: 'pending' },
    { label: 'Blocked',      value: 'blocked' },
  ];
 
  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.svc.loadStats();
    this.svc.loadUsers(1);
 
    // Debounced search
    this.searchControl.valueChanges.pipe(
      debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$),
    ).subscribe(q => { this.svc.setSearch(q ?? ''); this.cdr.markForCheck(); });
 
    // Re-render on every state change (required for OnPush)
    this.svc.users$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.svc.stats$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.svc.loading$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.svc.statsLoading$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.svc.actionLoading$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.svc.modalOpen$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.svc.filters$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }
 
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
 
  // ─── Filters ───────────────────────────────────────────────────────────────
  onRoleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as RoleFilter;
    this.svc.setRoleFilter(val);
  }
 
  onStatusChange(event: Event): void {
    this.svc.setStatusFilter((event.target as HTMLSelectElement).value as StatusFilter);
  }
 
  // ─── Stat Card Click ────────────────────────────────────────────────────────
  onStatCardClick(role: RoleFilter): void {
    this.svc.setRoleFilter(role);
    // sync the select dropdown visually
    this.selectedRoleValue = role;
  }
 
  isActiveRole(role: RoleFilter): boolean {
    return this.svc.filters.role === role;
  }
 
  // ─── Modal ─────────────────────────────────────────────────────────────────
  openModal(user: User): void  { this.svc.openModal(user); }
  closeModal(): void           { this.svc.closeModal(); }
 
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) this.closeModal();
  }
 
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.svc.modalOpen) this.closeModal();
  }
 
  // ─── Actions ───────────────────────────────────────────────────────────────
  toggleStatus(user: User, event: Event): void {
    event.stopPropagation();
    this.svc.toggleStatus(user._id).subscribe();
  }
 
  deleteUser(user: User, event: Event): void {
    event.stopPropagation();
    this.svc.deleteUser(user._id).subscribe();
  }
 
  toggleStatusFromModal(): void {
    const user = this.svc.selectedUser;
    if (user) this.svc.toggleStatus(user._id).subscribe({ complete: () => this.closeModal() });
  }
 
  deleteFromModal(): void {
    const user = this.svc.selectedUser;
    if (user) this.svc.deleteUser(user._id).subscribe({ complete: () => this.closeModal() });
  }
 
  // ─── Pagination ────────────────────────────────────────────────────────────
  prevPage(): void { this.svc.goToPage(this.svc.currentPage - 1); }
  nextPage(): void { this.svc.goToPage(this.svc.currentPage + 1); }
 
  get hasPrev():    boolean { return this.svc.currentPage > 1; }
  get hasNext():    boolean { return this.svc.currentPage < this.svc.totalPages; }
  get showingFrom():number  { return (this.svc.currentPage - 1) * this.svc.LIMIT + 1; }
  get showingTo():  number  { return Math.min(this.svc.currentPage * this.svc.LIMIT, this.svc.totalResult); }
 
  // ─── Template Helpers ──────────────────────────────────────────────────────
  getInitials(name: string)    { return this.svc.getInitials(name); }
  getTimeAgo(date: string)     { return this.svc.getTimeAgo(date); }
  getRoleDisplay(role: string) { return this.svc.getRoleDisplay(role); }
  getStatusDisplay(s: string)  { return this.svc.getStatusDisplay(s); }
  isActionLoading(id: string)  { return this.svc.isActionLoading(id); }
  trackByUser(_: number, u: User): string { return u._id; }
}
 
