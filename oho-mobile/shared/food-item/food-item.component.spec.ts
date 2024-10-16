import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FoodItemComponent } from './food-item.component';

describe('FoodItemComponent', () => {
  let component: FoodItemComponent;
  let fixture: ComponentFixture<FoodItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FoodItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
