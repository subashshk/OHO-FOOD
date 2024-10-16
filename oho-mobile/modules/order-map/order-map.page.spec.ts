import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderMapPage } from './order-map.page';

describe('OrderMapPage', () => {
  let component: OrderMapPage;
  let fixture: ComponentFixture<OrderMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
