import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterActionBar } from './footer-action-bar';

describe('FooterActionBar', () => {
  let component: FooterActionBar;
  let fixture: ComponentFixture<FooterActionBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterActionBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterActionBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
