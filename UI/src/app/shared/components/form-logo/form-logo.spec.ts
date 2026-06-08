import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLogo } from './form-logo';

describe('FormLogo', () => {
  let component: FormLogo;
  let fixture: ComponentFixture<FormLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLogo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
