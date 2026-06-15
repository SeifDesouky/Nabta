import { Component, ElementRef } from '@angular/core';
import { GuideService } from '../../../../core/services/educational/educational.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Guide, GuideType } from '../../../../core/models/educational.model';
import { DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-edu',
  standalone: true,
  imports: [NgFor,DatePipe],
  templateUrl: './edu.component.html',
  styleUrl: './edu.component.css'
})
export class EduComponent {

    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();

  guides:     Guide[]  = [];
  allGuides: Guide[] = [];
  loading     = true;
  searchQuery = '';

  readonly filterTabs: { label: string; value: GuideType | 'all'; icon: string }[] = [
    { label: 'All',       value: 'all',      icon: 'apps'       },
    { label: 'Articles',  value: 'article',  icon: 'article'    },
    { label: 'Videos',    value: 'video',    icon: 'videocam'   },
    { label: 'Tutorials', value: 'tutorial', icon: 'assignment' },
  ];



topContributors = [
  { name: 'Sarah Jensen',    role: 'Agronomist'     },
  { name: 'Marcus Chen',     role: 'Soil Specialist' },
  { name: 'Elena Rodriguez', role: 'Data Scientist'  },
];


  constructor(
    readonly guideService: GuideService,
    private router: Router,
    private authService:AuthService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.guideService.loadGuides({ page: 1 });

    this.guideService.guides$
      .pipe(takeUntil(this.destroy$))
      .subscribe(guides => this.guides = guides);

    this.guideService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Debounce search - 350ms after user stops typing
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.guideService.loadGuides({
        page: 1,
        type: this.guideService.activeFilter === 'all' ? undefined : this.guideService.activeFilter,
        search: query || undefined
      });
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  // ── Filtered list (client-side fallback while API responds) ──────────
  get filteredGuides(): Guide[] {
    if (!this.searchQuery.trim()) return this.guides;
    const q = this.searchQuery.toLowerCase();
    return this.guides.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.content.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  // ── Filter ────────────────────────────────────────
  setFilter(type: GuideType | 'all'): void {
    this.guideService.setFilter(type);
      this.guideService.loadGuides({
    page: 1,
    type: type === 'all' ? undefined : type,
    search: this.searchQuery || undefined
  });
  }

  isActive(type: GuideType | 'all'): boolean {
    return this.guideService.activeFilter === type;
  }

  clearFilter(): void {
    this.guideService.setFilter('all');
  }

  get articlesCount(): number {
  return this.guides.filter(g => g.guide_type === 'article').length;
}

get videosCount(): number {
  return this.guides.filter(g => g.guide_type === 'video').length;
}

get tutorialsCount(): number {
  return this.guides.filter(g => g.guide_type === 'tutorial').length;
}

get totalCount(): number {
  return this.guides.length;
}
}
