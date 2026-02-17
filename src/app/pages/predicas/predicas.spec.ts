import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Predicas } from './predicas';

describe('Predicas', () => {
  let component: Predicas;
  let fixture: ComponentFixture<Predicas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Predicas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Predicas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
