import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodSalesOverTimeComponent } from './food-sales-over-time.component';

describe('FoodSalesOverTimeComponent', () => {
  let component: FoodSalesOverTimeComponent;
  let fixture: ComponentFixture<FoodSalesOverTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodSalesOverTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodSalesOverTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
