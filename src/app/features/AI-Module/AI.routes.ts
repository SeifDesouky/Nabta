import { Routes } from '@angular/router';
import { AiChatbotComponent } from './pages/ai-chatbot/ai-chatbot.component';
import { RecommendationComponent } from './pages/recommendation/recommendation.component';



export const AI_ROUTES: Routes = [
  {
    path:'chatbot',component:AiChatbotComponent
  },
  {path:'recommendation',component:RecommendationComponent}
  
];

