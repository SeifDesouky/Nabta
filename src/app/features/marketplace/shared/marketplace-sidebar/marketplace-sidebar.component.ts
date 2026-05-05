import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
export interface MarketFilters {
  category: string;
  price: number;
  location: string;
  rating: number;
}
@Component({
  selector: 'app-marketplace-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './marketplace-sidebar.component.html',
  styleUrl: './marketplace-sidebar.component.css'
})
export class MarketplaceSidebarComponent implements OnInit, OnDestroy{
@Output() filtersChanged = new EventEmitter<MarketFilters>();

  // ── Filters State ──
  categories = ['Grains & Seeds', 'Fertilizers', 'Tools & Equipment', 'Organic Produce'];
  selectedCategory = 'Grains & Seeds';

  priceMax = 1000;
  selectedPrice = 500;
  locationQuery = '';

  ratings = [4, 3];
  selectedRating = 4;

  // ── Debounce Subjects ──
  private priceSubject = new Subject<number>();
  private locationSubject = new Subject<string>();
  private subs: Subscription[] = [];

  ngOnInit(): void {
    // 400ms debounce للـ Price
    this.subs.push(
      this.priceSubject.pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(val => {
          this.selectedPrice = val;
          this.emitFilters();
        })
    );

    // 500ms debounce للـ Location
    this.subs.push(
      this.locationSubject.pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(val => {
          this.locationQuery = val;
          this.emitFilters();
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this._aiTimer) clearTimeout(this._aiTimer);
  }

  // ── Emit Data to Parent ──
  private emitFilters(): void {
    this.filtersChanged.emit({
      category: this.selectedCategory,
      price: this.selectedPrice,
      location: this.locationQuery,
      rating: this.selectedRating
    });
  }

  // ── Filter Actions ──
  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.emitFilters();
  }

  onPriceChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.selectedPrice = val; // تحديث الـ UI فوراً
    this.priceSubject.next(val); // الـ API هيتأخر 400ms
  }

  onLocationChange(val: string): void {
    this.locationQuery = val;
    this.locationSubject.next(val);
  }

  selectRating(r: number): void {
    this.selectedRating = r;
    this.emitFilters();
  }

  clearFilters(): void {
    this.selectedCategory = this.categories[0];
    this.selectedPrice = 500;
    this.locationQuery = '';
    this.selectedRating = 4;
    this.emitFilters();
  }

  // ── Helpers ──
  get pricePct(): number {
    return (this.selectedPrice / this.priceMax) * 100;
  }

  getStarFill(s: number, r: number): string {
    return s <= r ? "'FILL' 1" : "'FILL' 0";
  }

  // ── AI Tools Flyout (Based on your Expert Sidebar design) ──
  aiFlyoutOpen = false;
  aiFlyoutTop = '0px';
  aiFlyoutLeft = '0px';
  private _aiTimer: any;

  showAiFlyout(el: HTMLElement): void {
    if (this._aiTimer) clearTimeout(this._aiTimer);
    const rect = el.getBoundingClientRect();
    this.aiFlyoutTop = rect.top + 'px';
    this.aiFlyoutLeft = (rect.right + 10) + 'px';
    this.aiFlyoutOpen = true;
  }

  keepAiFlyout(): void {
    if (this._aiTimer) clearTimeout(this._aiTimer);
  }

  scheduleHideAiFlyout(): void {
    this._aiTimer = setTimeout(() => {
      this.aiFlyoutOpen = false;
    }, 130);
  }
}
