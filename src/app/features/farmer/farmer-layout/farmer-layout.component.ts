import { Component, ChangeDetectionStrategy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FarmerSidebarComponent } from '../shared/farmer-sidebar/farmer-sidebar.component';
import { INotification } from '../../../core/models/notifications.model';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-expert-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FarmerSidebarComponent],
  template: `
    <div class="expert-shell">
      <!-- Sidebar (shared across all expert pages) -->
<app-farmer-sidebar></app-farmer-sidebar>
      <!-- Right: header + page content -->
      <div class="expert-body md:ml-[17.5rem] flex flex-col min-h-screen">

        <!-- Sticky Header -->
        <header class="expert-header ">
          <div class="header-brand">
            <span class="material-symbols-outlined ms-fill text-primary header-icon">dashboard</span>
            <h2 class="header-title">Farmer Dashboard</h2>
          </div>
          <div class="header-actions">
            <!-- ══ NOTIFICATION BELL ══ -->
      <div class="relative" #notifAnchor>
        <button
          (click)="toggleNotifDropdown()"
          class="relative p-2 text-zinc-500 hover:bg-[#f3f3f3] rounded-full transition-colors">
          <span class="material-symbols-outlined" style="font-size:22px;">notifications</span>
          <!-- Red dot — only when unread > 0 -->
          <span
            *ngIf="unreadCount > 0"
            class="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5
                   bg-red-500 rounded-full border-2 border-white
                   flex items-center justify-center
                   text-white text-[9px] font-bold leading-none">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </button>

        <!-- ══ NOTIFICATION DROPDOWN ══ -->
        <div
          *ngIf="notifOpen"
          class="absolute right-0 mt-2 w-80 bg-white rounded-2xl
                 shadow-[0_8px_32px_rgba(43,66,40,0.14)] border border-[#eaeaea]
                 overflow-hidden z-[500]">

          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <span class="text-sm font-bold text-text-main">Notifications</span>
            <span *ngIf="unreadCount > 0"
              class="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {{ unreadCount }} new
            </span>
          </div>

          <!-- Loading -->
          <div *ngIf="notifLoading" class="py-8 flex items-center justify-center">
            <span class="material-symbols-outlined text-zinc-300 animate-spin" style="font-size:24px;">progress_activity</span>
          </div>

          <!-- Empty -->
          <div *ngIf="!notifLoading && notifications.length === 0"
            class="py-10 flex flex-col items-center gap-2 text-center px-4">
            <span class="material-symbols-outlined text-zinc-300" style="font-size:40px;">notifications_off</span>
            <p class="text-sm text-zinc-400 font-medium">No notifications yet</p>
          </div>

          <!-- List -->
          <ul *ngIf="!notifLoading && notifications.length > 0"
            class="max-h-[340px] overflow-y-auto divide-y divide-[#f5f5f5]">
            <li
              *ngFor="let n of notifications"
              (click)="readNotif(n)"
              class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
              [ngClass]="n.isRead ? 'bg-white hover:bg-[#fafafa]' : 'bg-primary/[0.04] hover:bg-primary/[0.08]'">

              <!-- Icon bubble -->
              <div class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                [ngClass]="getNotifIconBg(n.type)">
                <span class="material-symbols-outlined" style="font-size:15px;font-variation-settings:'FILL' 1;"
                  [ngClass]="getNotifIconColor(n.type)">
                  {{ getNotifIcon(n.type) }}
                </span>
              </div>

              <!-- Text -->
              <div class="flex-1 min-w-0">
                <p class="text-[12.5px] font-semibold text-text-main leading-snug truncate">{{ n.title }}</p>
                <p class="text-[11.5px] text-zinc-400 mt-0.5 line-clamp-2 leading-snug">{{ n.message }}</p>
                <p class="text-[10px] text-zinc-300 mt-1">{{ n.createdAt | date:'MMM d, h:mm a' }}</p>
              </div>

              <!-- Unread dot -->
              <div *ngIf="!n.isRead" class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
            </li>
          </ul>

        </div>
      </div>
      <!-- ══ END NOTIFICATION BELL ══ -->
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
  /* ── Nav collapse animation ─────────────────── */
  #nav-above,
  #nav-below {
    max-height: 0;
    overflow:   hidden;
    opacity:    0;
    transition: max-height .35s cubic-bezier(.4,0,.2,1),
                opacity    .25s ease;
  }
  #nav-above.open,
  #nav-below.open { opacity: 1; }

  /* ── Arrow rotation ─────────────────────────── */
  #nav-arrow {
    transition: transform .35s cubic-bezier(.4,0,.2,1);
    display: block;
    line-height: 1;
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
export class FarmerLayoutComponent {
    notifications: INotification[] = [];
    notifOpen: boolean = false;
    notifLoading: boolean = false;
    unreadCount: number = 0;
    sortOpen: boolean = false;
constructor(
    private notifService:NotificationService ,
    private eRef: ElementRef
  ) {}

  ngOnInit(){
    this.loadUnreadCount();
  }
    @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.notifOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.notifOpen = false;
    }
    if (this.sortOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.sortOpen = false;
    }
  }

    // ══════════════════════════════════════════════════════
  //  NOTIFICATION METHODS
  // ══════════════════════════════════════════════════════
 
  /** Fetch unread count on page load (lightweight call) */
  loadUnreadCount(): void {
    this.notifService.getUnreadCount().subscribe({
      next: (count) => (this.unreadCount = count),
      error: (err)  => console.error('Could not fetch unread count', err),
    });
  }
 
  /** Toggle dropdown — lazy-load notifications list on first open */
  toggleNotifDropdown(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }
 
  /** Fetch all notifications */
  loadNotifications(): void {
    this.notifLoading = true;
    this.notifService.getAll().subscribe({
      next: (list) => {
        this.notifications = list;
        this.notifLoading  = false;
      },
      error: (err) => {
        console.error('Could not fetch notifications', err);
        this.notifLoading = false;
      },
    });
  }
 
  /** Mark one notification as read and update the local state */
  readNotif(n: INotification): void {
    if (n.isRead) return;
    this.notifService.markAsRead(n._id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => console.error('Could not mark as read', err),
    });
  }
 
  /** Icon helpers — map notification type to a Material Symbol */
  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      order:   'shopping_bag',
      payment: 'payments',
      message: 'chat',
      alert:   'warning',
      system:  'info',
    };
    return map[type] ?? 'notifications';
  }
 
  getNotifIconBg(type: string): string {
    const map: Record<string, string> = {
      order:   'bg-blue-50',
      payment: 'bg-emerald-50',
      message: 'bg-violet-50',
      alert:   'bg-amber-50',
      system:  'bg-primary/10',
    };
    return map[type] ?? 'bg-primary/10';
  }
 
  getNotifIconColor(type: string): string {
    const map: Record<string, string> = {
      order:   'text-blue-500',
      payment: 'text-emerald-500',
      message: 'text-violet-500',
      alert:   'text-amber-500',
      system:  'text-primary',
    };
    return map[type] ?? 'text-primary';
  }
}