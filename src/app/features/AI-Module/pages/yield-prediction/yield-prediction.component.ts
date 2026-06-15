// ─────────────────────────────────────────────
//  YieldPredictionComponent
//  Drop-in replacement for the existing page
// ─────────────────────────────────────────────

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YieldService } from '../../../../core/services/AI-Module/yield/yield.service';
import { YieldForecastResponse, YieldRow } from '../../../../core/models/AI.models/yield.model';
import { YieldChartComponent } from '../yield-chart/yield-chart.component';
interface CropOption {
  value: string;       // API plant_name value
  label: string;
  img: string;
  imgLabel: string;
}

@Component({
  selector: 'app-yield-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, YieldChartComponent],
  templateUrl: './yield-prediction.component.html',
})
export class YieldPredictionComponent {

  
  // ── Form state ──────────────────────────────────────────────────────────────
  selectedCrop   = '';
  projectedYear  = new Date().getFullYear() + 1;
  areaFeddan: number | null = null;
 
  // ── Plants dropdown ─────────────────────────────────────────────────────────
  plantsList: string[] = [];
  plantsLoading = true;
  plantsError   = '';
 
  // ── UI state ────────────────────────────────────────────────────────────────
  isLoading     = false;
  errorMessage  = '';
  forecastReady = false;
 
  // ── Result state ────────────────────────────────────────────────────────────
  response: YieldForecastResponse | null = null;
  yieldPerFeddan = '—';
  totalProduction = '—';
  forecastTon     = '—';
 
  // ── Farm image (static map by keyword — fallback to generic) ─────────────
  currentFarmImg   = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=900&h=400&fit=crop&crop=center';
  currentFarmLabel = 'Egyptian Farmland';
 
  // Keyword → Unsplash image map (extend as needed)
  private readonly imgMap: Record<string, { img: string; label: string }> = {
    apple:      { img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=900&h=400&fit=crop', label: 'Apple Orchards' },
    rice:       { img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&h=400&fit=crop', label: 'Rice Fields' },
    wheat:      { img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&h=400&fit=crop', label: 'Wheat Fields' },
    maize:      { img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&h=400&fit=crop', label: 'Maize Fields' },
    corn:       { img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&h=400&fit=crop', label: 'Corn Fields' },
    cotton:     { img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=900&h=400&fit=crop', label: 'Cotton Fields' },
    sugarcane:  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=400&fit=crop', label: 'Sugarcane Fields' },
    sugar:      { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=400&fit=crop', label: 'Sugar Fields' },
    tomato:     { img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&h=400&fit=crop', label: 'Tomato Fields' },
    tomatoes:   { img: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&h=400&fit=crop', label: 'Tomato Fields' },
    banana:     { img: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=900&h=400&fit=crop', label: 'Banana Plantation' },
    date:       { img: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=900&h=400&fit=crop', label: 'Date Palm Farms' },
    grape:      { img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=900&h=400&fit=crop', label: 'Grape Vineyards' },
    orange:     { img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=900&h=400&fit=crop', label: 'Citrus Orchards' },
    citrus:     { img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=900&h=400&fit=crop', label: 'Citrus Orchards' },
    lemon:      { img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=900&h=400&fit=crop', label: 'Citrus Orchards' },
    potato:     { img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&h=400&fit=crop', label: 'Potato Fields' },
    onion:      { img: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=900&h=400&fit=crop', label: 'Onion Fields' },
    watermelon: { img: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=900&h=400&fit=crop', label: 'Watermelon Fields' },
    strawberry: { img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=900&h=400&fit=crop', label: 'Strawberry Fields' },
    barley:     { img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&h=400&fit=crop', label: 'Barley Fields' },
    sunflower:  { img: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=900&h=400&fit=crop', label: 'Sunflower Fields' },
    olive:      { img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&h=400&fit=crop', label: 'Olive Groves' },
    fig:        { img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900&h=400&fit=crop', label: 'Fig Trees' },
    mango:      { img: 'https://images.unsplash.com/photo-1554246218-c9d26d1e5e27?w=900&h=400&fit=crop', label: 'Mango Orchards' },
    sesame:     { img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=900&h=400&fit=crop', label: 'Sesame Fields' },
    soya:       { img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=900&h=400&fit=crop', label: 'Soybean Fields' },
    sorghum:    { img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&h=400&fit=crop', label: 'Sorghum Fields' },
  };
 
  constructor(private yieldService: YieldService) {}
 
  // ── Init: load plants list ──────────────────────────────────────────────────
  ngOnInit(): void {
    this.yieldService.getPlants().subscribe({
      next: (res) => {
        this.plantsList   = res.plants;
        this.plantsLoading = false;
      },
      error: () => {
        this.plantsError   = 'Failed to load crop list.';
        this.plantsLoading = false;
      },
    });
  }
 
  // ── Submit forecast ─────────────────────────────────────────────────────────
  onGenerateForecast(): void {
    if (!this.selectedCrop) { this.shake('crop-select'); return; }
    if (!this.areaFeddan || this.areaFeddan <= 0) { this.shake('area'); return; }
 
    this.isLoading    = true;
    this.errorMessage = '';
    this.forecastReady = false;
    this.response      = null;
 
    this.yieldService.getForecast({
      plant_name: this.selectedCrop,
      end_year:   this.projectedYear,
    }).subscribe({
      next:  (data) => this.handleSuccess(data),
      error: (err)  => this.handleError(err),
    });
  }
 
  private handleSuccess(data: YieldForecastResponse): void {
    this.response = data;
 
    // Yield per feddan from latest historical row with area data
    const lastRow = [...data.rows]
      .filter(r => r.type === 'historical' && r.area_feddan !== null)
      .sort((a, b) => b.year - a.year)[0];
 
    const rate = lastRow ? lastRow.production_ton / lastRow.area_feddan! : 0;
 
    this.yieldPerFeddan  = rate.toFixed(2);
    this.totalProduction = (rate * this.areaFeddan!).toFixed(2);
    this.forecastTon     = data.forecast_total_ton.toLocaleString('en-EG', { maximumFractionDigits: 0 });
 
    // Farm image — match by keyword from crop name
    const match = this.resolveImage(this.selectedCrop);
    this.currentFarmImg   = match.img;
    this.currentFarmLabel = match.label;
 
    this.isLoading     = false;
    this.forecastReady = true;
  }
 
  private handleError(err: any): void {
    this.isLoading    = false;
    this.errorMessage = 'Failed to reach the forecast API. Please try again.';
    console.error('[YieldService] Error:', err);
  }
 
  /** Match crop name (case-insensitive keyword scan) to image */
  private resolveImage(cropName: string): { img: string; label: string } {
    const lower = cropName.toLowerCase();
    for (const keyword of Object.keys(this.imgMap)) {
      if (lower.includes(keyword)) return this.imgMap[keyword];
    }
    return { img: this.currentFarmImg, label: cropName };
  }
 
  private shake(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#ba1a1a';
    el.style.boxShadow   = '0 0 0 3px rgba(186,26,26,0.12)';
    setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1200);
  }
 
  // ── Template helpers ────────────────────────────────────────────────────────
  get forecastStatusLabel(): string {
    if (this.isLoading)     return 'Calculating...';
    if (this.forecastReady) return 'Forecast Ready';
    return 'Awaiting Input';
  }

}