
import {
  Component, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FarmerDashboardService } from '../../../../core/services/farmer/farmer-dashboard/farmer-dashboard.service';
 

@Component({
  selector: 'app-add-crop-modal',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './add-crop-modal.component.html',
  styleUrl: './add-crop-modal.component.css'
})
export class AddCropModalComponent implements OnInit, OnDestroy{
  private readonly destroy$ = new Subject<void>();
  readonly svc = inject(FarmerDashboardService);
  private readonly fb  = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
 
  form!: FormGroup;
  soilTypes = ['Sandy', 'Loamy', 'Clay', 'Silty', 'Peaty', 'Chalky', 'Loose'];
  selectedSoil: string[] = [];
  errorMsg = '';
 
  ngOnInit(): void {
    this.form = this.fb.group({
      cropName:    ['', [Validators.required, Validators.minLength(2)]],
      areaSize:    [null],
      plantingDate:['', Validators.required],
    });
 
    this.svc.modalOpen$.pipe(takeUntil(this.destroy$)).subscribe(open => {
      if (open) { this.form.reset(); this.selectedSoil = []; this.errorMsg = ''; }
      this.cdr.markForCheck();
    });
 
    this.svc.addCropLoading$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }
 
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
 
  toggleSoil(type: string): void {
    const idx = this.selectedSoil.indexOf(type);
    if (idx > -1) this.selectedSoil.splice(idx, 1);
    else          this.selectedSoil.push(type);
  }
 
  isSoilSelected(type: string): boolean {
    return this.selectedSoil.includes(type);
  }
 
  submit(): void {
    if (this.form.invalid || this.svc.addCropLoading) return;
    this.errorMsg = '';
 
    const { cropName, areaSize, plantingDate } = this.form.value;
    this.svc.addCrop({
      cropName,
      areaSize: areaSize ?? undefined,
      soilType: this.selectedSoil.length ? this.selectedSoil : undefined,
      plantingDate,
    }).subscribe({
      error: () => {
        this.errorMsg = 'Failed to add crop. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
 
  close(): void { this.svc.closeModal(); }
 
  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) this.close();
  }
 
  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

}
