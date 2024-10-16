import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RatingReviewComponent } from './rating-review.component';

describe('RatingReviewComponent', () => {
  let component: RatingReviewComponent;
  let fixture: ComponentFixture<RatingReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingReviewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RatingReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
