import { TestBed } from '@angular/core/testing';

import { ConsulationService } from './consulation.service';

describe('ConsulationService', () => {
  let service: ConsulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
