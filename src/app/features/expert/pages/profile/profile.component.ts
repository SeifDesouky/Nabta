
import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ExpertProfileService } from '../../../../core/services/expert/expertProfile/expert-profile.service';
import { ProfileTab } from '../../../../core/models/expert/expert-profile.model';
 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  readonly svc = inject(ExpertProfileService);

  tabs = [
    { label: 'Info', value: 'info' as ProfileTab, icon: 'person' },
    { label: 'Posts', value: 'posts' as ProfileTab, icon: 'article' },
    { label: 'Tips', value: 'tips' as ProfileTab, icon: 'lightbulb' },
  ];

  activity :any;


  ngOnInit(): void {
    this.svc.loadProfile();

    // نحدث activity بعد تحميل البيانات
    this.svc.posts$.subscribe(() => {
      this.activity = this.svc.getRecentActivity();
    });

    this.svc.tips$.subscribe(() => {
      this.activity = this.svc.getRecentActivity();
    });
  }


  getInitials(name: string) {
    return this.svc.getInitials(name);
  }

  timeAgo(date: string) {
    return this.svc.timeAgo(date);
  }

  getStatusConfig(status: string) {
    return this.svc.getStatusConfig(status);
  }


  isTab(tab: ProfileTab) {
    return this.svc.activeTab === tab;
  }

  setTab(tab: ProfileTab) {
    this.svc.setTab(tab);
  }

  deletePost(postId: string, event: Event) {
    event.stopPropagation();

    this.svc.deletePost(postId).subscribe();
  }

  deleteTip(tipId: string, event: Event) {
    event.stopPropagation();

    this.svc.deleteTip(tipId).subscribe();
  }

  downloadCV() {
    this.svc.downloadCV();
  }
}
