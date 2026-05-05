import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerProfileComponent } from './farmer-profile.component';

describe('FarmerProfileComponent', () => {
  let component: FarmerProfileComponent;
  let fixture: ComponentFixture<FarmerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
