import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { SegmentList } from 'src/app/models/segment-list.model';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { PlatformServices } from '@globalEnums/services.enum';
import { ProductService } from 'src/app/services/product.service';
import { PlatformService } from 'src/app/services/platform.service';
import { Store } from 'src/app/models/store.model';
import { ToastService } from 'src/app/services/toast.service';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-food-search',
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss'],
})
export class FoodSearchComponent extends subscribedContainerMixin() implements OnInit {
  @Input() searchText: string = '';

  @Output() inputFocusEvent = new EventEmitter();

  public autoProductCompleteData: Store[] = [];
  public storeAutoCompleteData: Store[] = [];
  public currentServiceType: PlatformServices;
  public isLoading: boolean = false;
  public inputFocused: boolean = false;
  public searchBarIsExpanded: boolean = false;
  public searchSegments: {Restaurant: string, Item: string} = {
    Restaurant: 'restaurant',
    Item: 'item',
  };
  public foodSegmentList: SegmentList[] = [
    { label: 'Restaurants', value: this.searchSegments.Restaurant},
    { label: 'Items', value: this.searchSegments.Item}
  ];
  public currentSegment: string = this.searchSegments.Restaurant;

  public storeList: any = {
    avgRating: 4.0,
    cuisineType: 'Variety Cuisine',
    id: 6,
    logo: 'https://t3.ftcdn.net/jpg/03/24/73/92/360_F_324739203_keeq8udvv0P2h1MLYJ0GLSlTBagoXS48.jpg',
    name: 'RestaurantName',
    storeIsOpen: true,
    reviewsCount: 2
  }
  public isKeyboardOpen: boolean = false;

  constructor(
    private platformService: PlatformService,
    private productService: ProductService,
    private toastService: ToastService,
    private zone: NgZone,
  ) {
    super();
  }

  ngOnInit(): void {
    this.currentServiceType = this.platformService.getCurrentServiceType();
    this.listenToKeyboardEvent();
  }

  public onFocus(): void {
    this.inputFocused = true;
    this.inputFocusEvent.emit(this.inputFocused);
  }

  public onBlur(): void {
    this.inputFocused = false;
    this.inputFocusEvent.emit(this.inputFocused);
  }

  public showSearchedList(event: any): void {
    // todo: this method triggers when the user search
    this.productService
      .getAutoCompleteData(
        this.searchText,
        this.currentServiceType,
        null,
        null,
        true
      )
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.isLoading = false)
      )
      .subscribe((res: any) => {
        this.autoProductCompleteData = [];
        this.storeAutoCompleteData = [];
        this.autoProductCompleteData = res?.data?.storesWithSpecificProducts;
        this.storeAutoCompleteData = res?.data?.stores;
      },
      (error) => {
        this.toastService.presentToast(
          'Something went wrong. Please try again.',
          2000,
          'danger'
        );
      });
  }

  public clearSearch(): void {
    // todo: this method triggers when the user clears search
  }

  public searchBarExpanded(expanded: boolean): void {
    setTimeout(() => {
      if(expanded) {
        // todo: need to be implement on implementation task
      }
    }, 250)
    this.searchBarIsExpanded = expanded;
    if(!expanded) {
      this.inputFocused = false;
      this.inputFocusEvent.emit(this.inputFocused);
      this.searchText = '';
    }
  }

  public foodSegmentChanged(event: any): void {
    this.currentSegment = event;
  }

  private listenToKeyboardEvent(): void {
    Keyboard.addListener('keyboardWillShow', () => {
      this.zone.run(() => {
        this.isKeyboardOpen = true;
      });
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.zone.run(() => {
        this.isKeyboardOpen = false;
      });
    });
  }
}
