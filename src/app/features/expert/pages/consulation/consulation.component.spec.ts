import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulationComponent } from './consulation.component';

describe('ConsulationComponent', () => {
  let component: ConsulationComponent;
  let fixture: ComponentFixture<ConsulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
