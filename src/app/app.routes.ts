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

export const routes: Routes = [
  {
    path: '', component: MainLayoutComponent, children: [
      {
        path:'',component:HomeComponent
      }
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
  {path:'**',redirectTo:'auth/login'}
];
