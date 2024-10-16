import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TextareaWithCountComponent } from './textarea-with-count.component';

describe('TextareaWithCountComponent', () => {
  let component: TextareaWithCountComponent;
  let fixture: ComponentFixture<TextareaWithCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextareaWithCountComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaWithCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
