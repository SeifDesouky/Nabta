import { TestBed } from '@angular/core/testing';

import { BuyerProfileService } from './buyer-profile.service';

describe('BuyerProfileService', () => {
  let service: BuyerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
