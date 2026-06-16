import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerProfileService } from '../../../../core/services/buyer/buyer-profile/buyer-profile.service';

export type BuyerProfileTab = 'info' | 'orders';

@Component({
  selector: 'app-buyer-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buyer-profile.component.html',
  styleUrl:    './buyer-profile.component.css',
})
export class BuyerProfileComponent implements OnInit {
  readonly svc = inject(BuyerProfileService);

  tabs = [
    { label: 'Personal Info', value: 'info'   as BuyerProfileTab, icon: 'person'       },
    { label: 'Account Info',  value: 'orders' as BuyerProfileTab, icon: 'shopping_bag' },
  ];

  ngOnInit(): void { this.svc.loadProfile(); }

  getInitials(name: string) { return this.svc.getInitials(name); }
  timeAgo(date: string)     { return this.svc.timeAgo(date);     }
  isTab(tab: BuyerProfileTab) { return this.svc.activeTab === tab; }
  setTab(tab: BuyerProfileTab) { this.svc.setTab(tab); }
  openEdit()  { this.svc.openEditModal();  }
  closeEdit() { this.svc.closeEditModal(); }

  saveEdit(form: { name: string; phone: string; company: string; address: string }) {
    this.svc.updateProfile(form);
  }
}