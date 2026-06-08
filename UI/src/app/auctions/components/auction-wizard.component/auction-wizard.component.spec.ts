import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionWizardComponent } from './auction-wizard.component';

describe('AuctionWizardComponent', () => {
  let component: AuctionWizardComponent;
  let fixture: ComponentFixture<AuctionWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionWizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
