import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  isLoading = false;
  errorMessage = '';
  emailSent = false;
  sentEmail = '';

  constructor(private authService: AuthService, private router: Router) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const email = this.form.value.email!;

    this.authService.forgetPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.sentEmail = email;
        this.emailSent = true;
        // save email so reset page can use it
        localStorage.setItem('resetEmail', email);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Something went wrong. Please try again.';
      },
    });
  }

  goToReset() {
    this.router.navigate(['/reset-password']);
  }

  resetState() {
    this.emailSent = false;
    this.sentEmail = '';
    this.form.reset();
  }
}
