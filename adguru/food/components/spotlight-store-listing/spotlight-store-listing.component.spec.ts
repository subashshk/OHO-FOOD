import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightStoreListingComponent } from './spotlight-store-listing.component';

describe('SpotlightStoreListingComponent', () => {
  let component: SpotlightStoreListingComponent;
  let fixture: ComponentFixture<SpotlightStoreListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpotlightStoreListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotlightStoreListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
