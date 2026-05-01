import { TestBed } from '@angular/core/testing';

import { EducationalService } from './educational.service';

describe('EducationalService', () => {
  let service: EducationalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EducationalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
