import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
 
export interface ExpertNavItem {
  label:  string;
  icon:   string;
  route:  string;
  filled?: boolean;
}

@Component({
  selector: 'app-expert-sidebar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './expert-sidebar.component.html',
  styleUrl: './expert-sidebar.component.css'
})
export class ExpertSidebarComponent {
  constructor(private router: Router) {
  this.router.events.subscribe(e => console.log(e));
}
  readonly mainNav: ExpertNavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',  route: '/expert/dashboard'      },
    { label: 'Consultations',   icon: 'forum',      route: '/expert/consultations'  },
    { label: 'Educational',     icon: 'school',     route: '/educational'         },
    { label: 'Profile',         icon: 'person',     route: '/expert/profile'        },
    { label: 'Chats',         icon: 'person',     route: '/community/chats'        },
  ];
 
  readonly supportNav: ExpertNavItem[] = [
    { label: 'Help Center', icon: 'help_outline', route: '/help' },
  ];
  // Community Flyout
communityFlyoutOpen = false;
communityFlyoutTop  = '0px';
communityFlyoutLeft = '0px';
private _communityTimer: any;

showCommunityFlyout(el: HTMLElement): void {
  if (this._communityTimer) clearTimeout(this._communityTimer);
  const rect              = el.getBoundingClientRect();
  this.communityFlyoutTop  = rect.top  + 'px';
  this.communityFlyoutLeft = (rect.right + 10) + 'px';
  this.communityFlyoutOpen = true;
}

keepCommunityFlyout(): void {
  if (this._communityTimer) clearTimeout(this._communityTimer);
}

scheduleHideCommunityFlyout(): void {
  this._communityTimer = setTimeout(() => {
    this.communityFlyoutOpen = false;
  }, 130);
}

}
