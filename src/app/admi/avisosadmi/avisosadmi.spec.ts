import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avisosadmi } from './avisosadmi';

describe('Avisosadmi', () => {
  let component: Avisosadmi;
  let fixture: ComponentFixture<Avisosadmi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avisosadmi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Avisosadmi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
