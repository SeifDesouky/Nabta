import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketNavbarComponent } from './market-navbar.component';

describe('MarketNavbarComponent', () => {
  let component: MarketNavbarComponent;
  let fixture: ComponentFixture<MarketNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
