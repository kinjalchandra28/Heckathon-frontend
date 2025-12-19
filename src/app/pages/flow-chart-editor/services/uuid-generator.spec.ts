import { TestBed } from '@angular/core/testing';

import { UuidGenerator } from './uuid-generator';

describe('UuidGenerator', () => {
  let service: UuidGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UuidGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
