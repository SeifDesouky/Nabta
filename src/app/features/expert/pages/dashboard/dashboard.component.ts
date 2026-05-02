import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ExpertDashboardService } from '../../../../core/services/expert/expertDashboard/expert-dashboard.service';
 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  // ── Service ─────────────────────────────
  svc = inject(ExpertDashboardService);

  // ── Local state mapped from observables ─
  posts: any[] = [];
  stats: any = {};
  loading = false;

  // ── UI State ────────────────────────────
  activeTab: string = 'info';

  tabs = [
    { label: 'Info', value: 'info', icon: 'person' },
    { label: 'Posts', value: 'posts', icon: 'article' },
    { label: 'Tips', value: 'tips', icon: 'lightbulb' }
  ];

  // ── Mock / placeholder data (for UI sections you didn’t wire yet) ─
  activity: any[] = [];

  recentInquiries: any[] = [
    {
      initials: 'AH',
      name: 'Ahmed Hassan',
      subject: 'Tomato leaf infection',
      priority: 'high',
      time: '2h ago'
    },
    {
      initials: 'MO',
      name: 'Mohamed Omar',
      subject: 'Soil nutrient issue',
      priority: 'medium',
      time: '5h ago'
    }
  ];

  scheduledConsultations: any[] = [
    {
      month: 'May',
      day: '12',
      time: '10:00 AM',
      subject: 'Wheat disease analysis',
      farmer: 'Ali Mahmoud',
      type: 'video',
      priority: 'primary'
    },
    {
      month: 'May',
      day: '14',
      time: '01:30 PM',
      subject: 'Irrigation planning',
      farmer: 'Hassan Ali',
      type: 'call',
      priority: 'tertiary'
    }
  ];

  // ── Lifecycle ───────────────────────────
  ngOnInit(): void {
    this.svc.loadDashboard();

    combineLatest({
      posts: this.svc.posts$,
      stats: this.svc.stats$,
      loading: this.svc.loading$
    }).subscribe(({ posts, stats, loading }) => {
      this.posts = posts;
      this.stats = stats;
      this.loading = loading;
    });
  }

  // ── Tabs ────────────────────────────────
  isTab(tab: string): boolean {
    return this.activeTab === tab;
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  // ── Helpers ─────────────────────────────
  getInitials(name: string = ''): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  timeAgo(date: string | Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // ── Status Config ───────────────────────
  getStatusConfig(status: string) {
    const map: any = {
      approved: { label: 'Approved', bg: '#e7f6ec', color: '#0d631b' },
      pending: { label: 'Pending', bg: '#fff4e5', color: '#8e3d00' },
      rejected: { label: 'Rejected', bg: '#ffe5e5', color: '#ba1a1a' }
    };
    return map[status] || map.pending;
  }

  // ── Priority Config ─────────────────────
  getPriorityConfig(priority: string) {
    const map: any = {
      high: { label: 'High', bg: '#ffe5e5', color: '#ba1a1a' },
      medium: { label: 'Medium', bg: '#fff4e5', color: '#8e3d00' },
      low: { label: 'Low', bg: '#e7f6ec', color: '#0d631b' }
    };
    return map[priority] || map.medium;
  }

  // ── Actions ─────────────────────────────
  downloadCV(): void {
    if (!this.svc.cvUrl) return;
    window.open(this.svc.cvUrl, '_blank');
  }

  deletePost(id: string, event: Event): void {
    event.stopPropagation();
    console.log('Delete post:', id);
    // call API here later
  }

  deleteTip(id: string, event: Event): void {
    event.stopPropagation();
    console.log('Delete tip:', id);
    // call API here later
  }

  // ── Impact metrics (right side bars) ────
  get farmersHelpedPct(): number {
    return Math.min((this.stats.farmersHelped || 0) / 10, 100);
  }

  get solvedCasesPct(): number {
    return Math.min((this.stats.solvedCases || 0) / 20, 100);
  }
}
