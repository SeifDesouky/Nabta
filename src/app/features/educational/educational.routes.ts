// app.routes.ts أو educational-routing.module.ts
// أضف الـ routes دي:

import { Routes } from '@angular/router';
import { EducationalComponent } from './pages/educational/educational.component';
import { GuideDetailsComponent } from './pages/guide-details/guide-details.component';


export const educationalRoutes: Routes = [
  {
    path: '',
    component: EducationalComponent
  },
  {
    path: 'guide/:id',
    component: GuideDetailsComponent
  }
];

// ── Folder structure المطلوبة ─────────────────────────────────────────
// src/app/features/educational/
// ├── educational.component.ts       ← موجود (معدّل)
// ├── educational.component.html     ← موجود (معدّل)
// └── guide-detail/
//     ├── guide-detail.component.ts  ← جديد
//     └── guide-detail.component.html ← جديد