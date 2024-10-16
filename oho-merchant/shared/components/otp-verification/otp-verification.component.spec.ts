import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OtpVerificationComponent } from './otp-verification.component';

describe('OtpVerificationComponent', () => {
  let component: OtpVerificationComponent;
  let fixture: ComponentFixture<OtpVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpVerificationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OtpVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
