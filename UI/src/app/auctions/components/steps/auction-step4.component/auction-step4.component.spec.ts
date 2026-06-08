import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionStep4Component } from './auction-step4.component';

describe('AuctionStep4Component', () => {
  let component: AuctionStep4Component;
  let fixture: ComponentFixture<AuctionStep4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionStep4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionStep4Component);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
