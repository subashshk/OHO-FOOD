import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByProductComponent } from './sales-by-product.component';

describe('SalesByProductComponent', () => {
  let component: SalesByProductComponent;
  let fixture: ComponentFixture<SalesByProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesByProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
