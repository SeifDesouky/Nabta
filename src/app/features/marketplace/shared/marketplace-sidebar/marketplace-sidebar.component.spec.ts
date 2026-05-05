import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceSidebarComponent } from './marketplace-sidebar.component';

describe('MarketplaceSidebarComponent', () => {
  let component: MarketplaceSidebarComponent;
  let fixture: ComponentFixture<MarketplaceSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
