import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth/auth.guard';
import { HomeComponent } from './features/home/pages/home/home.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { VerifyComponent } from './features/auth/pages/verify/verify.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { CommunityFeedComponent } from './features/community/pages/community/community.component';
import { ExpertApplicationsComponent } from './features/admin/pages/expert-applications/expert-applications.component';
import { EducationalComponent } from './features/educational/pages/educational/educational.component';

export const routes: Routes = [
  {
    path: '', component: MainLayoutComponent, children: [
      { path: '', component: HomeComponent },
      {
        path: 'marketplace', loadChildren: () => import('./features/marketplace/market.routes').then(m => m.marketplaceRoutes)
      },
      // {
      //   path: 'community', loadChildren: () => import('./features/community/pages/community/community.component').then(m => m.CommunityFeedComponent)

      // }
      {path:'community',component:CommunityFeedComponent},
      {path:'educational',loadChildren: () => import('./features/educational/educational.routes').then(m => m.educationalRoutes)}

    ]
  },
  {
    path: 'auth', component: AuthLayoutComponent, children:[
      {path:'login',component:LoginComponent},
      {path:'register',component:RegisterComponent},
      {path:'verify',component:VerifyComponent},
      {path:'forgot-password',component:ForgotPasswordComponent},
      {path:'reset-password',component:ResetPasswordComponent},
    ]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)          // add your auth guard here
    // canActivate: [adminGuard],          // add your auth guard here
  },
  {
  path: '**',
  loadComponent: () =>
    import('./features/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
