import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionStep1Component } from './auction-step1.component';

describe('AuctionStep1Component', () => {
  let component: AuctionStep1Component;
  let fixture: ComponentFixture<AuctionStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionStep1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionStep1Component);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
