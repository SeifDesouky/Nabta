import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-market-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './market-sidebar.component.html',
  styleUrl: './market-sidebar.component.css'
})
export class MarketSidebarComponent {
@Output() filtersChange = new EventEmitter<any>();

filters = {
  category: 'Grains & Seeds',
  price: 500,
  rating: 4,
  location: ''
};

updateFilters() {
  this.filtersChange.emit(this.filters);
  }

  selectedCategory = 'Grains & Seeds';
  selectedPrice = 500;
  location = '';
  selectedRating = 4;

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.emitFilters();
  }

  onPriceChange(value: number) {
    this.selectedPrice = value;
    this.emitFilters();
  }

  onLocationChange(value: string) {
    this.location = value;
    this.emitFilters();
  }

  selectRating(rating: number) {
    this.selectedRating = rating;
    this.emitFilters();
  }

  clearAll() {
    this.selectedCategory = 'Grains & Seeds';
    this.selectedPrice = 500;
    this.location = '';
    this.selectedRating = 4;

    this.emitFilters();
  }

  private emitFilters() {
    this.filtersChange.emit({
      category: this.selectedCategory,
      maxPrice: this.selectedPrice,
      location: this.location,
      rating: this.selectedRating
    });
  }
}
