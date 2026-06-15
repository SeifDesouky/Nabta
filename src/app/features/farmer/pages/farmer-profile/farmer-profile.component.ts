import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerProfileService } from '../../../../core/services/farmer/farmer-profile/farmer-profile.service';
export type FarmerProfileTab = 'info' | 'crops';
@Component({
  selector: 'app-farmer-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farmer-profile.component.html',
  styleUrl: './farmer-profile.component.css'
})
export class FarmerProfileComponent {
readonly svc = inject(FarmerProfileService);

  tabs = [
    { label: 'Farm Info', value: 'info' as FarmerProfileTab, icon: 'person' },
    { label: 'My Crops',  value: 'crops' as FarmerProfileTab, icon: 'eco' },
  ];

  ngOnInit(): void {
    this.svc.loadProfile();
  }

  getInitials(name: string) { return this.svc.getInitials(name); }
  timeAgo(date: string) { return this.svc.timeAgo(date); }
  
  isTab(tab: FarmerProfileTab) { return this.svc.activeTab === tab; }
  setTab(tab: FarmerProfileTab) { this.svc.setTab(tab); }
  openEdit() { this.svc.openEditModal(); }
closeEdit() { this.svc.closeEditModal(); }

saveEdit(form: {
  name: string; phone: string; region: string; climate: string; soilType: string
}) {
  this.svc.updateProfile(form);
}
}
