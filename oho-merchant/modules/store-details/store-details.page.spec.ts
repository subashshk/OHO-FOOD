import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoreDetailsPage } from './store-details.page';

describe('StoreDetailsPage', () => {
  let component: StoreDetailsPage;
  let fixture: ComponentFixture<StoreDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreDetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
