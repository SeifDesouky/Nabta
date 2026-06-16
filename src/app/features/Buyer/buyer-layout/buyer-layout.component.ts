import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BuyerSidebarComponent } from '../shared/buyer-sidebar/buyer-sidebar.component';

@Component({
  selector: 'app-buyer-layout',
  standalone: true,
  imports: [RouterOutlet, BuyerSidebarComponent],
  templateUrl: './buyer-layout.component.html',
  styleUrl: './buyer-layout.component.css',
})
export class BuyerLayoutComponent {}