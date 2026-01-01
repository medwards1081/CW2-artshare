import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualTestsComponent } from './manual-tests.component';

describe('ManualTestsComponent', () => {
  let component: ManualTestsComponent;
  let fixture: ComponentFixture<ManualTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualTestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
