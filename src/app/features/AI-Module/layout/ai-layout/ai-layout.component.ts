// ─────────────────────────────────────────────────────────────────────────────
//  AiLayoutComponent  (FIXED)
//  — Listens to (collapseChange) from sidebar
//  — Adjusts main area margin via [style.margin-left] (not Tailwind class)
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AiSidebarComponent } from '../../components/sidebar/sidebar.component';

interface Breadcrumb { label: string; icon: string; }

@Component({
  selector: 'app-ai-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiSidebarComponent],
  templateUrl: './ai-layout.component.html',
})
export class AiLayoutComponent implements OnInit {

  currentPage: Breadcrumb = { label: 'AI Tools', icon: 'psychology' };
  notifOpen    = false;
  unreadCount  = 0;

  // ── Sidebar width — driven by collapseChange event ──────────────────────
  sidebarCollapsed = false;

  /** The margin-left to apply to the main area (mirrors sidebar width) */
  get mainMargin(): string {
    return this.sidebarCollapsed ? '4.5rem' : '17.5rem';
  }

  private readonly pageMap: Record<string, Breadcrumb> = {
    'chatbot':          { label: 'AI Chatbot',          icon: 'smart_toy'  },
    'yield-prediction': { label: 'Yield Prediction',    icon: 'monitoring' },
    'recommendation':   { label: 'Crop Recommendation', icon: 'yard'       },
  };

  constructor(private router: Router, private eRef: ElementRef) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
    ).subscribe(url => this.updateBreadcrumb(url));
  }

  private updateBreadcrumb(url: string): void {
    const segment = url.split('/').pop() ?? '';
    this.currentPage = this.pageMap[segment] ?? { label: 'AI Tools', icon: 'psychology' };
  }

  /** Called by (collapseChange) output from sidebar */
  onSidebarCollapse(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (this.notifOpen && !this.eRef.nativeElement.contains(e.target)) {
      this.notifOpen = false;
    }
  }

  toggleNotif(): void { this.notifOpen = !this.notifOpen; }
}