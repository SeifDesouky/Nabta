import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCropModalComponent } from './add-crop-modal.component';

describe('AddCropModalComponent', () => {
  let component: AddCropModalComponent;
  let fixture: ComponentFixture<AddCropModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCropModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCropModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
