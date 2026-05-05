import { TestBed } from '@angular/core/testing';

import { FarmerDashboardService } from './farmer-dashboard.service';

describe('FarmerDashboardService', () => {
  let service: FarmerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
