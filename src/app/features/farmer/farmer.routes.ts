import { Routes } from '@angular/router';
import { FarmerLayoutComponent } from './farmer-layout/farmer-layout.component';

// Expert layout wraps all expert pages (sidebar + header)
// import { ExpertLayoutComponent } from './expert-layout/expert-layout.component';

export const FARMER_ROUTES: Routes = [

      
      {
          path: '',
          component: FarmerLayoutComponent,   // ← uncomment when layout is ready
          children: [
        {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/farmer-dashboard/farmer-dashboard.component')
            .then(m => m.FarmerDashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/farmer-profile/farmer-profile.component')
            .then(m => m.FarmerProfileComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/farmer-products/farmer-products.component')
            .then(m => m.FarmerProductsComponent),
      },
      
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      ],
}
    //   {
    //     path: 'profile',
    //     loadComponent: () =>
    //       import('./pages/profile/profile.component')
    //         .then(m => m.ProfileComponent),
    //   },

    ]