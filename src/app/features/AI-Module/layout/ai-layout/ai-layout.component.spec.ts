import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiLayoutComponent } from './ai-layout.component';

describe('AiLayoutComponent', () => {
  let component: AiLayoutComponent;
  let fixture: ComponentFixture<AiLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
