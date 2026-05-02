import { TestBed } from '@angular/core/testing';

import { ExpertDashboardService } from './expert-dashboard.service';

describe('ExpertDashboardService', () => {
  let service: ExpertDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpertDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
