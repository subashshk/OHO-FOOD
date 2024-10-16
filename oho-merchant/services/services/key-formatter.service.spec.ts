import { TestBed } from '@angular/core/testing';

import { KeyFormatterService } from './key-formatter.service';

describe('KeyFormatterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KeyFormatterService = TestBed.get(KeyFormatterService);
    expect(service).toBeTruthy();
  });
});
