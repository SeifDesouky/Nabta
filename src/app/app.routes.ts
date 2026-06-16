import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { roleGuard } from './core/guards/role/role.guard';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { VerifyComponent } from './features/auth/pages/verify/verify.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './features/home/pages/home/home.component';

export const routes: Routes = [
  {
    path: '', component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },

      // ✅ Marketplace — الكل حتى غير المسجلين (مفيش guard)
      {
        path: 'marketplace',
        loadChildren: () => import('./features/marketplace/market.routes')
          .then(m => m.marketplaceRoutes)
      },

      // ✅ Community — farmer + expert فقط
      {
        path: 'community',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['farmer', 'expert'] },
        loadChildren: () => import('./features/community/community.routes')
          .then(m => m.communityRoutes)
      },

      // ✅ Educational — الكل (مفيش guard)
      {
        path: 'educational',
        loadChildren: () => import('./features/educational/educational.routes')
          .then(m => m.educationalRoutes)
      },

      // ✅ Farmer — farmer فقط
      {
        path: 'farmer',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['farmer'] },
        loadChildren: () => import('./features/farmer/farmer.routes')
          .then(m => m.FARMER_ROUTES)
      },
    ]
  },

  // ✅ Auth — بدون guards
  {
    path: 'auth', component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'verify', component: VerifyComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ]
  },

  // ✅ Admin — admin فقط
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  },

  // ✅ Expert — expert فقط
  {
    path: 'expert',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['expert'] },
    loadChildren: () => import('./features/expert/expert.routes')
      .then(m => m.EXPERT_ROUTES)
  },
  {
  path: 'buyer',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['buyer'] },
  loadChildren: () => import('./features/Buyer/buyer.routes').then(m => m.BUYER_ROUTES)
},

  // ✅ AI — farmer فقط
  {
    path: 'ai',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['farmer'] },
    loadChildren: () => import('./features/AI-Module/AI.routes')
      .then(m => m.AI_ROUTES)
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];