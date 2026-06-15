import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

// Lazy-load each admin page
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,        // ← shell with sidebar + header
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'expert-applications',
        loadComponent: () =>
          import(
            './pages/expert-applications/expert-applications.component'
          ).then((m) => m.ExpertApplicationsComponent),
      },
      {
        path: 'educational',
        loadComponent: () =>
          import('./pages/edu/edu.component').then(
            (m) => m.EduComponent
          ),
      },
      {
        path: 'reported',
        loadComponent: () =>
          import('./pages/reported/reported.component').then(
            (m) => m.ReportedComponent
          ),
      },
      // {
      //   path: 'preferences',
      //   loadComponent: () =>
      //     import('./pages/preferences/preferences.component').then(
      //       (m) => m.PreferencesComponent
      //     ),
      // },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

// ─── How to register in app.routes.ts ────────────────────────────────────────
//
// export const routes: Routes = [
//   {
//     path: 'admin',
//     loadChildren: () =>
//       import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
//     canActivate: [adminGuard],          // add your auth guard here
//   },
//   { path: '**', redirectTo: 'admin' },
// ];
