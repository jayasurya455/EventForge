import { TestBed } from '@angular/core/testing';

import { UiRefreshService } from './ui-refresh.service';

describe('UiRefreshService', () => {
  let service: UiRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
