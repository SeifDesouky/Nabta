import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit, OnDestroy {
  seeds: { size: number; left: number; duration: number; delay: number; color: string }[] = [];

  private readonly seedColors = ['#a3f69c', '#88d982', '#c8e6c9', '#bfcaba', '#ffdbcf'];

  ngOnInit(): void {
    this.generateSeeds();
  }

  generateSeeds(): void {
    this.seeds = Array.from({ length: 18 }, () => ({
      size:     Math.random() * 6 + 4,
      left:     Math.random() * 100,
      duration: Math.random() * 12 + 10,
      delay:    Math.random() * 14,
      color:    this.seedColors[Math.floor(Math.random() * this.seedColors.length)]
    }));
  }

  ngOnDestroy(): void {}
}