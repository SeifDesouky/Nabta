import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  filled?: boolean;
}
@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {
readonly adminNav: NavItem[] = [
    { label: 'Dashboard',           icon: 'dashboard',          route: '/admin/dashboard' },
    { label: 'User Management',     icon: 'manage_accounts',    route: '/admin/users' },
    { label: 'Expert Applications', icon: 'verified_user',      route: '/admin/expert-applications', badge: 12, filled: true },
    { label: 'Educational Content', icon: 'post',    route: '/admin/educational' },
    { label: 'Reported Content', icon: 'post',    route: '/admin/reported' },
  ];

  readonly systemNav: NavItem[] = [
    { label: 'Preferences', icon: 'settings', route: '/admin/preferences' },
  ];

  constructor(private readonly router: Router) {}

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  trackByRoute(_: number, item: NavItem): string {
    return item.route;
  }
}
