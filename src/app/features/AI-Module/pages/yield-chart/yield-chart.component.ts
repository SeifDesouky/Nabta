// ─────────────────────────────────────────────────────────────────────────────
//  YieldChartComponent
//
//  Receives the API response via @Input() and renders a Chart.js line chart.
//  Shows historical bars (green) + forecast bar (amber dashed).
//
//  Dependencies: Chart.js loaded via CDN in index.html (see README)
//  No npm install needed — just add one <script> tag.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { YieldForecastResponse } from '../../../../core/models/AI.models/yield.model';

// Chart.js is loaded globally via CDN — declare it to satisfy TypeScript
declare const Chart: any;

@Component({
  selector: 'app-yield-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './yield-chart.component.html',
})
export class YieldChartComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() data: YieldForecastResponse | null = null;
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: any = null;

  ngAfterViewInit(): void {
    if (this.data) this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.canvasRef) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.data || !this.canvasRef) return;

    // Destroy old instance before re-rendering
    this.chart?.destroy();

    const rows = this.data.rows;

    const labels      = rows.map(r => r.year.toString());
    const productions = rows.map(r => r.production_ton);
    const types       = rows.map(r => r.type);

    // Color each bar: green for historical, amber for forecast
    const barColors = types.map(t =>
      t === 'forecast'
        ? 'rgba(245, 158, 11, 0.85)'   // amber
        : 'rgba(13, 99, 27, 0.75)'     // NABTA primary green
    );
    const borderColors = types.map(t =>
      t === 'forecast' ? '#d97706' : '#0a5217'
    );

    const ctx = this.canvasRef.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Production (Ton)',
            data: productions,
            backgroundColor: barColors,
            borderColor: borderColors,
            borderWidth: 1.5,
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: any[]) => `Year: ${items[0].label}`,
              label: (item: any) => {
                const val = (item.raw as number).toLocaleString('en-EG', { maximumFractionDigits: 0 });
                const type = types[item.dataIndex];
                return ` ${val} Ton  ${type === 'forecast' ? '(Forecast)' : '(Historical)'}`;
              },
            },
            backgroundColor: '#1a1c1c',
            titleColor: '#a3f69c',
            bodyColor: '#e8ebe4',
            padding: 12,
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6c7c66',
              font: { family: 'Inter', size: 11 },
              maxRotation: 45,
            },
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(191,202,186,0.3)',
            },
            ticks: {
              color: '#6c7c66',
              font: { family: 'Inter', size: 11 },
              callback: (val: number) => {
                if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
                if (val >= 1_000)    return (val / 1_000).toFixed(0) + 'K';
                return val;
              },
            },
          },
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart',
        },
      },
    });
  }
}