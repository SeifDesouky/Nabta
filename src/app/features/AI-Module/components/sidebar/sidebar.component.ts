// ─────────────────────────────────────────────────────────────────────────────
//  AiSidebarComponent  (FIXED)
//  — Emits collapseChange so AiLayoutComponent can adjust its margin
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label:    string;
  icon:     string;
  iconFill: boolean;
  route:    string;
  badge?:   string;
}

@Component({
  selector: 'app-ai-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class AiSidebarComponent implements OnInit {

  // ── Tell the parent when collapsed state changes ──────────────────────────
  @Output() collapseChange = new EventEmitter<boolean>();

  currentUserRole = localStorage.getItem('role') || 'farmer';

  get dashboardLink(): string {
    return this.currentUserRole === 'expert' ? '/expert/dashboard' : '/farmer/dashboard';
  }

  readonly navItems: NavItem[] = [
    { label: 'AI Chatbot',          icon: 'smart_toy',  iconFill: true,  route: '/ai/chatbot',          badge: 'New' },
    { label: 'Yield Prediction',    icon: 'monitoring', iconFill: false, route: '/ai/yield-prediction' },
    { label: 'Crop Recommendation', icon: 'yard',       iconFill: true,  route: '/ai/recommendation'   },
  ];

  collapsed = false;

  ngOnInit(): void {}

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapseChange.emit(this.collapsed);   // ← notify layout
  }
}