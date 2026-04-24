import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';

const passwordMatchValidator: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const pw = g.get('newPassword')?.value;
  const cpw = g.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userEmail = '';
  otpControls: FormControl[] = Array.from({ length: 6 }, () => new FormControl(''));

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  isSuccess = false;
  hasError = false;
  otpError = '';
  errorMessage = '';

  // Password strength
  strengthBars = [1, 2, 3, 4];

  constructor(private authService:AuthService){}

  form = new FormGroup(
    {
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit() {
    this.userEmail = localStorage.getItem('resetEmail') || '';

    // Live password strength
    this.form.get('newPassword')?.valueChanges.subscribe(() => {});
  }

  // ── Password strength ─────────────────────────────────────────────────────
  get passwordStrength(): number {
    const pw = this.form.get('newPassword')?.value || '';
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  }

  get strengthColor(): string {
    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
    return colors[this.passwordStrength - 1] ?? 'bg-red-400';
  }

  get strengthTextColor(): string {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];
    return colors[this.passwordStrength - 1] ?? 'text-red-500';
  }

  get strengthLabel(): string {
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.passwordStrength - 1] ?? 'Weak';
  }

  // ── OTP helpers ───────────────────────────────────────────────────────────
  get otpValue(): string {
    return this.otpControls.map(c => c.value?.trim() ?? '').join('');
  }

  get isOtpComplete(): boolean {
    return this.otpControls.every(c => c.value?.trim().length === 1);
  }

  private focusBox(index: number) {
    this.otpInputs.toArray()[index]?.nativeElement.focus();
  }

  onFocus(i: number) {
    this.hasError = false;
    this.otpError = '';
    this.otpInputs.toArray()[i]?.nativeElement.select();
  }

  onInput(event: Event, i: number) {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (val.length > 1) { this.fillFromString(val, i); return; }
    this.otpControls[i].setValue(val);
    if (val && i < 5) this.focusBox(i + 1);
  }

  onKeyDown(event: KeyboardEvent, i: number) {
    if (event.key === 'Backspace') {
      if (this.otpControls[i].value) { this.otpControls[i].setValue(''); }
      else if (i > 0) { this.otpControls[i - 1].setValue(''); this.focusBox(i - 1); }
      event.preventDefault();
    }
    if (event.key === 'ArrowLeft' && i > 0) this.focusBox(i - 1);
    if (event.key === 'ArrowRight' && i < 5) this.focusBox(i + 1);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    this.fillFromString(digits, 0);
  }

  private fillFromString(value: string, start: number) {
    const digits = value.replace(/\D/g, '');
    for (let i = 0; i < digits.length && start + i < 6; i++) {
      this.otpControls[start + i].setValue(digits[i]);
    }
    const next = this.otpControls.findIndex((c, i) => i >= start && !c.value);
    this.focusBox(next !== -1 ? next : Math.min(start + digits.length, 5));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit() {
    this.form.markAllAsTouched();

    if (!this.isOtpComplete) {
      this.hasError = true;
      this.otpError = 'Please enter the full 6-digit code.';
      return;
    }

    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.userEmail,
      code: String(this.otpValue),
      newPassword: this.form.value.newPassword!,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        localStorage.removeItem('resetEmail');
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message || 'Invalid or expired code. Please try again.';
        setTimeout(() => {
          this.otpControls.forEach(c => c.setValue(''));
          this.hasError = false;
          this.focusBox(0);
        }, 600);
      },
    });
  }
}
