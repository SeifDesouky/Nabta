import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YieldChartComponent } from './yield-chart.component';

describe('YieldChartComponent', () => {
  let component: YieldChartComponent;
  let fixture: ComponentFixture<YieldChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YieldChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YieldChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
