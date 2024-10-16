import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IonSegmentComponent } from './ion-segment.component';

describe('IonSegmentComponent', () => {
  let component: IonSegmentComponent;
  let fixture: ComponentFixture<IonSegmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IonSegmentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IonSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
