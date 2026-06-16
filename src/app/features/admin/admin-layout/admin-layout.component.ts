import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserManagementService } from '../../../core/services/admin/user-management/user-management.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, ReactiveFormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  readonly searchControl = new FormControl('');
  isUserManagementPage = false;
constructor(private router: Router, private userSvc: UserManagementService) {
  this.router.events.subscribe(e => {
    if (e instanceof NavigationEnd) {
      this.isUserManagementPage = e.url.includes('user-management');
      if (!this.isUserManagementPage) {
        this.searchControl.setValue('', { emitEvent: false });
        this.userSvc.setSearch(''); // كلير السيرش لما تمشي من الصفحة
      }
    }
  });

  this.searchControl.valueChanges.pipe(
    debounceTime(400),
    distinctUntilChanged()
  ).subscribe(q => {
    this.userSvc.setSearch(q ?? ''); // بعت دايماً بدون شرط
  });
}
}