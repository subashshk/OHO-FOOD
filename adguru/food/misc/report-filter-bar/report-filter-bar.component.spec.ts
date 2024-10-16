import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFilterBarComponent } from './report-filter-bar.component';

describe('ReportFilterBarComponent', () => {
  let component: ReportFilterBarComponent;
  let fixture: ComponentFixture<ReportFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportFilterBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
