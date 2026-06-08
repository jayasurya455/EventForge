import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionLiveComponent } from './auction-live.component';

describe('AuctionLiveComponent', () => {
  let component: AuctionLiveComponent;
  let fixture: ComponentFixture<AuctionLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionLiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionLiveComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
