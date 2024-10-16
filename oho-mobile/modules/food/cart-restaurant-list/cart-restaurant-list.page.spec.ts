import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CartRestaurantListPage } from './cart-restaurant-list.page';

describe('CartRestaurantListPage', () => {
  let component: CartRestaurantListPage;
  let fixture: ComponentFixture<CartRestaurantListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartRestaurantListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CartRestaurantListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
