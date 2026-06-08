import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionStep3Component } from './auction-step3.component';

describe('AuctionStep3Component', () => {
  let component: AuctionStep3Component;
  let fixture: ComponentFixture<AuctionStep3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionStep3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionStep3Component);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
