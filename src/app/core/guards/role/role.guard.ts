import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.getUserRole() || !route.data['roles']) {
    router.navigate(['/unauthorized']) // صفحه ال unauthorized
    return false;
  }
  return true;
};
