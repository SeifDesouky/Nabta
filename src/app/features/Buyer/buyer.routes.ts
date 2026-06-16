import { Routes } from '@angular/router';
import { BuyerLayoutComponent } from './buyer-layout/buyer-layout.component';

export const BUYER_ROUTES: Routes = [
  {
    path: '',
    component: BuyerLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/buyer-dashboard/buyer-dashboard.component').then(
            m => m.BuyerDashboardComponent
          ),
      },
      {
        path: 'my-orders',
        loadComponent: () =>
          import('../marketplace/pages/my-orders/my-orders.component').then(
            m => m.MyOrdersComponent
          ),
      },
      // buyer.routes.ts
      { path: 'profile', loadComponent: () => import('./pages/buyer-profile/buyer-profile.component').then(m => m.BuyerProfileComponent) }
    ],
  },
];