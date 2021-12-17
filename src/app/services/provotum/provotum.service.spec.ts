import { TestBed } from '@angular/core/testing';

import { ProvotumService } from './provotum.service';

describe('ProvotumService', () => {
  let service: ProvotumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProvotumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
