import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const userRole = auth.getUserRole();
  const allowedRoles: string[] = route.data['roles'] ?? [];

  // مش مسجل دخول خالص
  if (!userRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  // مسجل بس الـ role مش مسموحة
  if (!allowedRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};