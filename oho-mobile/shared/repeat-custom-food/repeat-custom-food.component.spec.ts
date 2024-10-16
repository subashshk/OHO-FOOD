import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RepeatCustomFoodComponent } from './repeat-custom-food.component';

describe('RepeatCustomFoodComponent', () => {
  let component: RepeatCustomFoodComponent;
  let fixture: ComponentFixture<RepeatCustomFoodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepeatCustomFoodComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RepeatCustomFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
