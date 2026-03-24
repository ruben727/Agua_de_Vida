import { TestBed } from '@angular/core/testing';

import { FaceAuth } from './face-auth';

describe('FaceAuth', () => {
  let service: FaceAuth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaceAuth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
