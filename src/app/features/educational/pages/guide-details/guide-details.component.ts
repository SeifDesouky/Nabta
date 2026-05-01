import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GuideService } from '../../../../core/services/educational/educational.service';
import { Guide, GuideType } from '../../../../core/models/educational.model';
 
@Component({
  selector: 'app-guide-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide-details.component.html',
  styleUrl: './guide-details.component.css'
})
export class GuideDetailsComponent {

  guide:        Guide | null = null;
  loading       = true;
  lightboxImage: string | null = null;
 
  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private guideService: GuideService
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
}
