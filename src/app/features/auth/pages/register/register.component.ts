import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

// ── Custom validator: password match ─────────────────────────────────────────
export const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  selectedRole: 'farmer' | 'expert' | 'buyer' = 'farmer';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  // ✅ السبب: أضفنا cvFile كـ property منفصلة لأن الـ FormControl مش بيدعم File objects
  cvFile: File | null = null;
  cvFileName = '';

  constructor(private authService: AuthService) {}

  form = new FormGroup(
    {
      // ── Common ────────────────────────────────────────────────────────────
      role: new FormControl<'farmer' | 'expert' | 'buyer'>('farmer'),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl(''),
      password: new FormControl('', [
              Validators.required,
              Validators.minLength(6),
              Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
      ]),
      confirmPassword: new FormControl('', Validators.required),
      terms: new FormControl(false, Validators.requiredTrue),

      // ── Farmer ───────────────────────────────────────────────────────────
      region: new FormControl(''),
      soilType: new FormControl(''),
      climate: new FormControl(''),

      // ── Expert ───────────────────────────────────────────────────────────
      expertiseAreas: new FormControl(''),
      experienceYears: new FormControl<number | null>(null),
      bio: new FormControl(''),

      // ── Buyer ────────────────────────────────────────────────────────────
      company: new FormControl(''),
    },
    { validators: passwordMatchValidator }
  );

  // ── Role selection ────────────────────────────────────────────────────────
  selectRole(role: 'farmer' | 'expert' | 'buyer') {
    this.selectedRole = role;
    this.form.patchValue({ role });
    // Reset role-specific fields on switch
    this.form.patchValue({
      region: '', soilType: '', climate: '',
      expertiseAreas: '', experienceYears: null, bio: '',
      company: '',
    });
    // ✅ reset الـ CV لو غير الـ role
    this.cvFile = null;
    this.cvFileName = '';
  }

  // ✅ السبب: بنحتاج handler خاص للـ file input عشان نحفظ الـ File object
  onCvUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.cvFile = input.files[0];
      this.cvFileName = input.files[0].name;
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit() {
    this.form.markAllAsTouched();
    // أضيف الـ 3 سطور دول مؤقتاً للـ debugging
  console.log('form valid?', this.form.valid);
  console.log('form errors:', this.form.errors);
  console.log('controls:', Object.fromEntries(
    Object.entries(this.form.controls).map(([k, v]) => [k, v.errors])
  ));
    if (this.form.invalid) return;

    const value = this.form.value;

    // ✅ السبب: بنبني الـ data object بشكل flat
    // الباك بيتوقع region/soilType/climate مباشرة مش جوه location object
    let data: any = {
      name: value.name,
      email: value.email,
      phone: value.phone || undefined,
      password: value.password,
      role: value.role,
    };

    if (value.role === 'farmer') {
      // ✅ flat fields مش nested object
      data.region = value.region || undefined;
      data.soilType = value.soilType || undefined;
      data.climate = value.climate || undefined;
    }

    if (value.role === 'expert') {
      data.expertiseAreas = value.expertiseAreas
        ? value.expertiseAreas.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      data.experienceYears = value.experienceYears ?? undefined;
      data.bio = value.bio || undefined;
      // ✅ السبب: بنضيف الـ CV file عشان الـ service تعمله FormData
      if (this.cvFile) data.cvFile = this.cvFile;
    }

    if (value.role === 'buyer') {
      data.company = value.company || undefined;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('ssss');

    this.authService.register(data).subscribe({
      next: () => this.authService.handleRegister(this.form.value.email ?? ''),
      error: (err) => {
        this.isLoading = false;
        console.log('full error:', JSON.stringify(err?.error));
  // الباك بيرجع errors كـ array مش message string
  const errors = err?.error?.errors;
  this.errorMessage = errors?.length
    ? errors.map((e: any) => e.message).join(', ')
    : 'Something went wrong. Please try again.';
      },
      complete: () => (this.isLoading = false),
    });
  }
}
