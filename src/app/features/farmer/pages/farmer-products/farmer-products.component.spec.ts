import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerProductsComponent } from './farmer-products.component';

describe('FarmerProductsComponent', () => {
  let component: FarmerProductsComponent;
  let fixture: ComponentFixture<FarmerProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
