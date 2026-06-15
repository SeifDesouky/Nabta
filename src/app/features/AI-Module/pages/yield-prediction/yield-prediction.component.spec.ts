import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YieldPredictionComponent } from './yield-prediction.component';

describe('YieldPredictionComponent', () => {
  let component: YieldPredictionComponent;
  let fixture: ComponentFixture<YieldPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YieldPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YieldPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
