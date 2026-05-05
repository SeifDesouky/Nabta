import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../API/api-service.service';
import { ILogin, ILoginResponse, IRegister, IVerify } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private api: ApiServiceService) {}

  login(data: ILogin) {
    return this.api.post<ILoginResponse>('user/login', data);
  }

  // ✅ السبب: شيلنا isExpertApproved من الفرونت لأن الباك بقى هو اللي بيرفض الـ expert
  // لو مش معتمد — بيرجع 401 ورسالة واضحة، الفرونت يعرضها في الـ error handler
  handleAuth(res: ILoginResponse) {
    const user = res.user;
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', user.role);
    
    if (user.role === 'admin') {
      this.router.navigate(['/admin/users']);
    } else if (user.role === 'farmer') {
      this.router.navigate(['/farmer']);
    } else if (user.role === 'expert') {
      this.router.navigate(['/expert']);
    } else if (user.role === 'buyer') {
      this.router.navigate(['/marketplace']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/auth/login']);
  }

  isLoggedin(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ السبب: الـ expert بيبعت FormData لأن الباك بيستقبل ملف CV (multipart/form-data)
  // الباقيين (farmer/buyer) بيبعتوا JSON عادي
  register(data: IRegister) {
    if (data.role === 'expert' && data.cvFile) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', data.role);
      if (data.phone) formData.append('phone', data.phone);
      if (data.expertiseAreas) {
        data.expertiseAreas.forEach(area => formData.append('expertiseAreas[]', area));
      }
      if (data.experienceYears != null) {
        formData.append('experienceYears', String(data.experienceYears));
      }
      if (data.bio) formData.append('bio', data.bio);
      formData.append('cv', data.cvFile);
      return this.api.postFormData('user/register', formData);
    }
console.log('r');

    // farmer & buyer — JSON عادي بدون cvFile
    const { cvFile, ...rest } = data;
    return this.api.post('user/register', rest);
  }

  handleRegister(email?: string) {
    if (email) localStorage.setItem('pendingEmail', email);
    console.log('x');

    this.router.navigate(['/auth/verify']);
  }

  resendVerification() {
    const email = localStorage.getItem('pendingEmail') || '';
    return this.api.post('user/verify', { email });
  }

  verifyAccount(data: IVerify) {
    return this.api.post('user/verify', data);
  }

  forgetPassword(email: string) {
    return this.api.post('user/forget', { email });
  }

  // ✅ السبب: code بقى string عشان الباك بيعمل !== string comparison
  resetPassword(data: { email: string; code: string; newPassword: string }) {
    return this.api.post('user/reset', data);
  }
}
