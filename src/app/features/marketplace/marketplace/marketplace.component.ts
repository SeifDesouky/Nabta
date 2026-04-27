import { Component } from '@angular/core';
import { ProductsComponent } from "../pages/products/products.component";
import { MarketSidebarComponent } from "../../../shared/components/market-sidebar/market-sidebar.component";

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [ProductsComponent, MarketSidebarComponent],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent {
filters: any = {};

onFiltersChange(newFilters: any) {
  this.filters = newFilters;
}
}
