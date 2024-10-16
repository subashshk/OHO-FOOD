import { TestBed } from '@angular/core/testing';

import { FormatterInteceptor } from './formatter-inteceptor';

describe('FormatterInteceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormatterInteceptor = TestBed.get(FormatterInteceptor);
    expect(service).toBeTruthy();
  });
});
