import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionStep2Component } from './auction-step2.component';

describe('AuctionStep2Component', () => {
  let component: AuctionStep2Component;
  let fixture: ComponentFixture<AuctionStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionStep2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionStep2Component);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
