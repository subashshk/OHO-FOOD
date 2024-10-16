import { TestBed } from '@angular/core/testing';

import { RealEstateCompanyService } from './real-estate-company.service';

describe('RealEstateCompanyService', () => {
  let service: RealEstateCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealEstateCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
