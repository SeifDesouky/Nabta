import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerSidebarComponent } from './farmer-sidebar.component';

describe('FarmerSidebarComponent', () => {
  let component: FarmerSidebarComponent;
  let fixture: ComponentFixture<FarmerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
