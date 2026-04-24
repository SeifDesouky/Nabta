import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
})
export class VerifyComponent implements OnInit, OnDestroy {
  // ── Template refs for focus management ──────────────────────────────────────
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  // ── State ───────────────────────────────────────────────────────────────────
  userEmail: string = '';
  otpControls: FormControl[] = Array.from({ length: 6 }, () => new FormControl(''));

  isLoading = false;
  isSuccess = false;
  hasError = false;
  errorMessage = '';

  isResending = false;
  resendSuccess = false;
  resendCountdown = 60;

  private countdownInterval: any;

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Grab the email saved during registration (optional — set in AuthService.handleRegister)
    this.userEmail = localStorage.getItem('pendingEmail') || '';
    this.authService.verifyAccount(this.userEmail)
    this.startCountdown();
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  get isComplete(): boolean {
    return this.otpControls.every(c => c.value?.trim().length === 1);
  }

  get otpValue(): string {
    return this.otpControls.map(c => c.value?.trim() ?? '').join('');
  }

  private startCountdown() {
    this.resendCountdown = 60;
    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.resendCountdown = 0;
      }
    }, 1000);
  }

  private clearError() {
    this.hasError = false;
    this.errorMessage = '';
  }

  private focusBox(index: number) {
    const inputs = this.otpInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  // ── Input handlers ───────────────────────────────────────────────────────────
  onFocus(index: number) {
    this.clearError();
    // Select content so user can overwrite easily
    const inputs = this.otpInputs.toArray();
    inputs[index]?.nativeElement.select();
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, ''); // digits only

    // If user typed more than 1 char (mobile autocomplete), fill multiple boxes
    if (val.length > 1) {
      this.fillFromString(val, index);
      return;
    }

    this.otpControls[index].setValue(val);

    if (val && index < 5) {
      this.focusBox(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (this.otpControls[index].value) {
        this.otpControls[index].setValue('');
      } else if (index > 0) {
        this.otpControls[index - 1].setValue('');
        this.focusBox(index - 1);
      }
      event.preventDefault();
    }

    if (event.key === 'ArrowLeft' && index > 0) this.focusBox(index - 1);
    if (event.key === 'ArrowRight' && index < 5) this.focusBox(index + 1);
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    this.fillFromString(digits, 0);
  }

  private fillFromString(value: string, startIndex: number) {
    const digits = value.replace(/\D/g, '');
    for (let i = 0; i < digits.length && startIndex + i < 6; i++) {
      this.otpControls[startIndex + i].setValue(digits[i]);
    }
    // Focus the next empty box or the last one
    const nextEmpty = this.otpControls.findIndex((c, i) => i >= startIndex && !c.value);
    this.focusBox(nextEmpty !== -1 ? nextEmpty : Math.min(startIndex + digits.length, 5));
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  submit() {
    if (!this.isComplete || this.isLoading) return;
    this.clearError();
    this.isLoading = true;

    this.authService.verifyAccount({ email: this.userEmail, code: this.otpValue }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message || 'Invalid or expired code. Please try again.';
        // Shake + clear boxes
        setTimeout(() => {
          this.otpControls.forEach(c => c.setValue(''));
          this.focusBox(0);
        }, 600);
      },
    });
  }

  // ── Resend ───────────────────────────────────────────────────────────────────
  resendCode() {
    if (this.resendCountdown > 0 || this.isResending) return;
    this.isResending = true;
    this.resendSuccess = false;
    this.clearError();

    // Call your resend endpoint — adjust to match your API
    this.authService.resendVerification().subscribe({
      next: () => {
        this.isResending = false;
        this.resendSuccess = true;
        this.startCountdown();
        setTimeout(() => (this.resendSuccess = false), 5000);
      },
      error: () => {
        this.isResending = false;
        this.errorMessage = 'Failed to resend. Please try again.';
      },
    });
  }
}
