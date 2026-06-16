import { TestBed } from '@angular/core/testing';

import { BuyerDashboardService } from './buyer-dashboard.service';

describe('BuyerDashboardService', () => {
  let service: BuyerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
