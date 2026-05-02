import { TestBed } from '@angular/core/testing';

import { ExpertProfileService } from './expert-profile.service';

describe('ExpertProfileService', () => {
  let service: ExpertProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpertProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
