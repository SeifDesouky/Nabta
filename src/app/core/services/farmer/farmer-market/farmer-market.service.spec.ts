import { TestBed } from '@angular/core/testing';

import { FarmerMarketService } from './farmer-market.service';

describe('FarmerMarketService', () => {
  let service: FarmerMarketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmerMarketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
