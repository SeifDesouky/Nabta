import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketSidebarComponent } from './market-sidebar.component';

describe('MarketSidebarComponent', () => {
  let component: MarketSidebarComponent;
  let fixture: ComponentFixture<MarketSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
