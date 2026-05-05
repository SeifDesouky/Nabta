import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertSidebarComponent } from './expert-sidebar.component';

describe('ExpertSidebarComponent', () => {
  let component: ExpertSidebarComponent;
  let fixture: ComponentFixture<ExpertSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
