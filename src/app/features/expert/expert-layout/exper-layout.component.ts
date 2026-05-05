import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpertSidebarComponent } from '../shared/expert-sidebar/expert-sidebar.component';

@Component({
  selector: 'app-expert-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ExpertSidebarComponent],
  template: `
    <div class="expert-shell">
      <!-- Sidebar (shared across all expert pages) -->
      <app-expert-sidebar></app-expert-sidebar>

      <!-- Right: header + page content -->
      <div class="expert-body">

        <!-- Sticky Header -->
        <header class="expert-header">
          <div class="header-brand">
            <span class="material-symbols-outlined ms-fill text-primary header-icon">dashboard</span>
            <h2 class="header-title">Expert Portal</h2>
          </div>
          <div class="header-actions">
            <div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20
                        flex items-center justify-center">
              <span class="material-symbols-outlined ms-fill text-primary"
                    style="font-size:22px;">account_circle</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="expert-main">
          <router-outlet></router-outlet>
        </main>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0d631b;
      --border: #e8e8e8;
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .ms-fill { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }

    .expert-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f8f8f5;
    }

    .expert-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      min-width: 0;
    }

    .expert-header {
      height: 4rem;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      flex-shrink: 0;
      z-index: 30;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: .75rem;
    }

    .header-icon { font-size: 20px !important; color: var(--primary); }

    .header-title {
      font-family: 'Manrope', sans-serif;
      font-weight: 800;
      font-size: 1.0625rem;
      color: var(--primary);
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: .75rem;
    }

    .expert-main {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .expert-main::-webkit-scrollbar { width: 4px; }
    .expert-main::-webkit-scrollbar-thumb { background: #bfcaba; border-radius: 10px; }
  `],
})
export class ExpertLayoutComponent {}