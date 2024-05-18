import { TestBed } from '@angular/core/testing';

import { FileVerificationService } from './file-verification.service';

describe('FileVerificationService', () => {
  let service: FileVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
