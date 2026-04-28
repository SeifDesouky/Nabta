import { TestBed } from '@angular/core/testing';

import { ExpretApplicationService } from './expret-application.service';

describe('ExpretApplicationService', () => {
  let service: ExpretApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpretApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
