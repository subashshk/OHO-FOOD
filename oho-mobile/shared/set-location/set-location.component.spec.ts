import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetLocationComponent } from './set-location.component';

describe('SetLocationComponent', () => {
  let component: SetLocationComponent;
  let fixture: ComponentFixture<SetLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetLocationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
