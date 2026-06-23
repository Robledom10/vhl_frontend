import { TestBed } from '@angular/core/testing';

import { PaymentsServiceService } from './payments.service.service';

describe('PaymentsServiceService', () => {
  let service: PaymentsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
