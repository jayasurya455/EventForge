import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueFormComponent } from './league-form.component';

describe('LeagueFormComponent', () => {
  let component: LeagueFormComponent;
  let fixture: ComponentFixture<LeagueFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
