import { TestBed } from '@angular/core/testing';

import { OptionTypeService } from './option-type.service';

describe('OptionTypeService', () => {
  let service: OptionTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptionTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
