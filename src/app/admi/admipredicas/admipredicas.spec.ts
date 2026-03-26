import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admipredicas } from './admipredicas';

describe('Admipredicas', () => {
  let component: Admipredicas;
  let fixture: ComponentFixture<Admipredicas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admipredicas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Admipredicas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
