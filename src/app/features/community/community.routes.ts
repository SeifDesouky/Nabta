// app.routes.ts أو educational-routing.module.ts
// أضف الـ routes دي:

import { Routes } from '@angular/router';
import { CommunityFeedComponent } from './pages/community/community.component';
import { TipsComponent } from './pages/tips/tips.component';



export const communityRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/community/community.component')
        .then(m => m.CommunityFeedComponent)
  },
  {
    path: 'tips',loadComponent: () =>
      import('./pages/tips/tips.component')
        .then(m => m.TipsComponent)
  },
  {
    path: 'chats',loadComponent: () =>
      import('./pages/chats/chats.component')
        .then(m => m.ChatsComponent)
  }
];
