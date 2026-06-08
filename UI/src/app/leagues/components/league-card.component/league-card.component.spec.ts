import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueCardComponent } from './league-card.component';

describe('LeagueCardComponent', () => {
  let component: LeagueCardComponent;
  let fixture: ComponentFixture<LeagueCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
