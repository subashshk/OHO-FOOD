import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApproveRefuseReturnComponent } from './approve-refuse-return.component';

describe('ApproveRefuseReturnComponent', () => {
  let component: ApproveRefuseReturnComponent;
  let fixture: ComponentFixture<ApproveRefuseReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRefuseReturnComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveRefuseReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
