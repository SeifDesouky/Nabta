import { Routes } from '@angular/router';
import { AiChatbotComponent } from './pages/ai-chatbot/ai-chatbot.component';
import { RecommendationComponent } from './pages/recommendation/recommendation.component';
import { YieldPredictionComponent } from './pages/yield-prediction/yield-prediction.component';

import { AiLayoutComponent } from './layout/ai-layout/ai-layout.component';
 
export const AI_ROUTES: Routes = [
  {
    path: '',
    component: AiLayoutComponent,
    children: [
 
      // Default redirect → yield-prediction
      {
        path: '',
        redirectTo: 'yield-prediction',
        pathMatch: 'full',
      },
 
      // ── Yield Prediction ──────────────────────────
      {
        path: 'yield-prediction',
        loadComponent: () =>
          import('./pages/yield-prediction/yield-prediction.component')
            .then(m => m.YieldPredictionComponent),
        title: 'Yield Prediction — NABTA',
      },
 
      // ── AI Chatbot ────────────────────────────────
      {
        path: 'chatbot',
        loadComponent: () =>
          import('./pages/ai-chatbot/ai-chatbot.component')
            .then(m => m.AiChatbotComponent),
        title: 'AI Chatbot — NABTA',
      },
 
      // ── Crop Recommendation ───────────────────────
      {
        path: 'recommendation',
        loadComponent: () =>
          import('./pages/recommendation/recommendation.component')
            .then(m => m.RecommendationComponent),
        title: 'Crop Recommendation — NABTA',
      },
 
    ],
  },
];
 

