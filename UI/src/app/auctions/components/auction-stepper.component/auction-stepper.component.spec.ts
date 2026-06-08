import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionStepperComponent } from './auction-stepper.component';

describe('AuctionStepperComponent', () => {
  let component: AuctionStepperComponent;
  let fixture: ComponentFixture<AuctionStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionStepperComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
