import { Routes } from '@angular/router';
import { ExpertLayoutComponent } from './expert-layout/exper-layout.component';


export const EXPERT_ROUTES: Routes = [
  {
    path: '',
    component: ExpertLayoutComponent,   // ← uncomment when layout is ready
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component')
            .then(m => m.ProfileComponent),
      },
      {
        path: 'consultations',
        loadComponent: () =>
          import('./pages/consulation/consulation.component')
            .then(m => m.ConsulationComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    }
  //   ],
  // },

  // ── Flat routes (no layout yet) ──────────────────────────────────────────
  // {
  //   path: 'dashboard',
  //   loadComponent: () =>
  //     import('./pages/dashboard/dashboard.component')
  //       .then(m => m.DashboardComponent),
  // },
  // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

// ── Register in app.routes.ts ────────────────────────────────────────────────
//
// export const routes: Routes = [
//   {
//     path: 'expert',
//     loadChildren: () =>
//       import('./features/expert/expert.routes').then(m => m.EXPERT_ROUTES),
//     canActivate: [expertGuard],
//   },
// ];