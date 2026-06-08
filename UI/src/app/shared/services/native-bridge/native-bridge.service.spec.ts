import { TestBed } from '@angular/core/testing';

import { NativeBridge } from './native-bridge';

describe('NativeBridge', () => {
  let service: NativeBridge;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeBridge);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
