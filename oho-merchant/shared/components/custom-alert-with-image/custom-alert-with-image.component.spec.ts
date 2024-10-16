import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomAlertWithImageComponent } from './custom-alert-with-image.component';

describe('CustomAlertWithImageComponent', () => {
  let component: CustomAlertWithImageComponent;
  let fixture: ComponentFixture<CustomAlertWithImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAlertWithImageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomAlertWithImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
