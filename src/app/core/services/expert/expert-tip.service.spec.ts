import { TestBed } from '@angular/core/testing';

import { ExpertTipService } from './expert-tip.service';

describe('ExpertTipService', () => {
  let service: ExpertTipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpertTipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
