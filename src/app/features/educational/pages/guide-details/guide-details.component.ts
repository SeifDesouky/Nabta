import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuideService } from '../../../../core/services/educational/educational.service';
import { Guide, GuideType } from '../../../../core/models/educational.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
 
@Component({
  selector: 'app-guide-details',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './guide-details.component.html',
  styleUrl: './guide-details.component.css'
})
export class GuideDetailsComponent {
  currentUserRole: string = localStorage.getItem('role') || 'farmer'; 

  get dashboardLink(): string {
    return this.currentUserRole === 'expert' ? '/expert/dashboard' : '/farmer/dashboard';
  }


  guide:        Guide | null = null;
  loading       = true;
  lightboxImage: string | null = null;
 
  // AI Flyout
  aiFlyoutOpen = false;
  aiFlyoutTop  = '0px';
  aiFlyoutLeft = '0px';
  private _hideTimer: any;

  // Nav
  navOpen = true;
topContributors = [
  { name: 'Sarah Jensen',    role: 'Agronomist'     },
  { name: 'Marcus Chen',     role: 'Soil Specialist' },
  { name: 'Elena Rodriguez', role: 'Data Scientist'  },
];

// ── AI Flyout ─────────────────────────────────────────
  showAiFlyout(el: HTMLElement): void {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    const rect       = el.getBoundingClientRect();
    this.aiFlyoutTop  = rect.top + 'px';
    this.aiFlyoutLeft = (rect.right + 10) + 'px';
    this.aiFlyoutOpen = true;
  }

  keepAiFlyout(): void {
    if (this._hideTimer) clearTimeout(this._hideTimer);
  }

  scheduleHideAiFlyout(): void {
    this._hideTimer = setTimeout(() => { this.aiFlyoutOpen = false; }, 130);
  }

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


  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private guideService: GuideService,
    private authService:AuthService
  ) {}
 
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading = false; return; }
 
    this.guideService.getGuideById(id).subscribe({
      next:  (guide) => { this.guide = guide; this.loading = false; },
      error: ()      => { this.loading = false; }
    });
  }
 
  // ── Navigation ────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/educational']);
  }
 
  // ── Lightbox ──────────────────────────────────────
  openImage(url: string): void  { this.lightboxImage = url; }
  closeLightbox(): void         { this.lightboxImage = null; }
 
  // ── Helpers ───────────────────────────────────────
  getFirstImage(guide: Guide): string {
    return guide.imageUrl?.[0] ?? 'assets/placeholder.png';
  }
 
  getTypeIcon(type: GuideType):  string { return this.guideService.getTypeIcon(type); }
  getTypeLabel(type: GuideType): string { return this.guideService.getTypeLabel(type); }
  timeAgo(date: string): string         { return this.guideService.timeAgo(date); }
 
  getTypePillClass(type: GuideType): string {
    const map: Record<GuideType, string> = {
      article:  'bg-blue-500/90 text-white',
      video:    'bg-purple-500/90 text-white',
      tutorial: 'bg-amber-500/90 text-white',
    };
    return map[type] ?? 'bg-primary/90 text-white';
  }
 
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  logout():void{
    this.authService.logout()
  }
}
