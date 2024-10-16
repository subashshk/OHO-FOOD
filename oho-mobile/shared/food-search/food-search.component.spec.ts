import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FoodSearchComponent } from './food-search.component';

describe('FoodSearchComponent', () => {
  let component: FoodSearchComponent;
  let fixture: ComponentFixture<FoodSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodSearchComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FoodSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
