import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FormChoiceFoodComponent } from './form-choice-food.component';

describe('FormChoiceFoodComponent', () => {
  let component: FormChoiceFoodComponent;
  let fixture: ComponentFixture<FormChoiceFoodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormChoiceFoodComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormChoiceFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
