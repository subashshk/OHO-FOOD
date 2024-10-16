import { TestBed } from '@angular/core/testing';

import { CustomerReturnsService } from './customer-returns.service';

describe('CustomerReturnsService', () => {
  let service: CustomerReturnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerReturnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
