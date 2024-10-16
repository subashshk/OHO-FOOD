import { CartAddErrorType } from './../../../enums/cart-add-error.enum';
import { AngularTokenService } from 'angular-token';
import { subscribedContainerMixin } from './../../subscribedContainer.mixin';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { PlatformService } from './../../../services/platform.service';
import { ProductOrderService } from './../../../services/product-order.service';
import { ToastService } from './../../../services/toast.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilityService } from './../../../services/utility.service';
import { OrderFoodComponent } from './../order-food/order-food.component';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Product } from './../../../models/product.model';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CustomAlertWithImageComponent } from '../custom-alert-with-image/custom-alert-with-image.component';
import { CustomAlertComponent } from '../custom-alert/custom-alert.component';
import { Store } from 'src/app/models/store.model';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { Address } from 'src/app/models/address.model';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { RepeatCustomFoodComponent } from '../repeat-custom-food/repeat-custom-food.component';
import { PlatformServices } from '@globalEnums/services.enum';
/// <reference types="@types/googlemaps" />
declare const google: any;

@Component({
  selector: 'app-food-item',
  templateUrl: './food-item.component.html',
  styleUrls: ['./food-item.component.scss'],
})
export class FoodItemComponent extends subscribedContainerMixin() implements OnInit, OnChanges {
  @Input() product: Product;
  @Input() store: Store;
  @Input() isSearchItem = false;
  @Input() showStore = false;
  @Input() showDesc = true;
  @Input() cartCount = 0;
  @Input() isCartItem = false;
  @Input() categoryName: string;
  @Input() listDesign: boolean = false;
  @Input() isFoodDetail: boolean = false;
  @Input() isLoader: boolean = false;
  @Input() isRestaurantCard: boolean = false;
  @Input() showAddBtn: boolean = true;
  @Input() isFoodSearch: boolean = false;

  isCreatingProductOrder = false;
  modal: any;
  public restaurantDistance: string;
  public restaurantDuration: string;
  public pickupAddress: Address;
  public pickupAddressSubscription: Subscription;
  initialFlag = true;

  @Output() itemUpdated = new EventEmitter();

  quantityForm: FormGroup;

  productTypes = {
    VEG: 'veg',
    NONVEG: 'non-veg',
  };

  constructor(
    private modalController: ModalController,
    public utility: UtilityService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private productOrderService: ProductOrderService,
    private platformService: PlatformService,
    private productService: ProductService,
    private router: Router,
    private tokenService: AngularTokenService,
    private alertController: AlertController,
    public globalService: GlobalEmitterService,
    private dataService: DataService
  ) {
    super();
    this.quantityForm = this.formBuilder.group({
      quantity: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    this.quantityForm.controls.quantity.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (this.cartCount !== res) {
          const valueChange = res - this.cartCount;
          this.cartCount = res;
          this.addProduct(res);
          // Track the change of each item quantity 
          this.globalService.cartCountChanged.emit(valueChange);
        }
        // Triggered when food item quantity is set to 0
        if (res ==0){
          this.initialFlag = true;
        }
      });
    if (this.product?.discountPercent) {
      this.product.discountPercent = Number(this.product?.discountPercent).toString();
    }
    this.getDistance();
  }

  ngOnDestroy(): void {
    if (this.pickupAddressSubscription) {
      this.pickupAddressSubscription.unsubscribe();
    }
  }

  get timing() {
    const currentDate = new Date();
    const currentDay = currentDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const timing = this.product.store.storeTimings[
      this.product.store.storeTimings.findIndex((timing) => currentDay === timing.day)
    ];
    return timing;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.cartCount) {
      this.quantityForm.controls.quantity.setValue(this.cartCount);
      // Trigger the initial view cart
      if (this.initialFlag) {
        this.globalService.cartCountChanged.emit(this.cartCount);
        this.initialFlag = false;
      }
    }    
  }

  public updateCartCount(): void {
    if (this.cartCount) {
      this.quantityForm.controls.quantity.setValue(this.cartCount);
      // Trigger the initial view cart
      if (this.initialFlag) {
        this.globalService.cartCountChanged.emit(this.cartCount);
        this.initialFlag = false;
      }
    }
  }

  addProduct(quantity: number) {
    this.changeCount(quantity);
  }

  checkProductStock(): boolean {
    if (this.product.inStock) {
      return true;
    } else {
      this.toastService.presentToast('Product is out of stock at the moment.', 2000, 'danger');
      return false;
    }
  }

  public createProductOrder(event: Event = null) {
    if (event) {
      event.stopPropagation();
    }
    this.cartCount = 1;
    this.quantityForm.controls.quantity.setValue(1);
    this.updateCartCount();
    this.isCreatingProductOrder = true;
    const request = {
      variantId: this.product.variantId || this.product.defaultVariantId,
      quantity: this.quantityForm.controls.quantity.value || 1,
      specialInstructions: this.quantityForm.value.instruction,
      service_type: PlatformServices.Food,
      store_id: this.product?.store?.id
    };
    this.tokenService
      .validateToken()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (stat) => {
          this.productService
            .createOrder(request)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
              (response) => {
                if (response.success) {
                  // this.toastService.presentToast(
                  //   'Item has been successfully added to the cart.',
                  //   2000
                // );
                this.cartCount = 1;
                this.quantityForm.controls.quantity.setValue(1);
                this.quantityForm.controls.quantity.valueChanges
                    .pipe(takeUntil(this.destroyed$))
                    .subscribe((res) => {
                      if (this.cartCount !== res) {
                        this.cartCount = res;
                        this.addProduct(res);
                      }
                    });
                  this.globalService.getOrderCount.emit(true);
                  this.isCreatingProductOrder = false;
                } else {
                  this.isCreatingProductOrder = false;
                  this.toastService.presentToast(response.message, 2000, 'danger');
                }
                this.productOrderService.updateCartCount(
                  this.platformService.getCurrentServiceType()
                );
              },
              (err) => {
                this.isCreatingProductOrder = false;
                if (err.error.errorType === CartAddErrorType.MultipleRestaurant) {
                  this.showDifferentRestaurantModal();
                } else {
                  this.showDifferentRestaurantModal();
                }
              }
            );
        },
        (err) => {
          this.isCreatingProductOrder = false;
          this.toastService.presentToast('You need to login first.', 2000, 'danger');
          this.navCtrl.navigateForward('login', {
            queryParams: {
              redirectUrl: this.router.url,
            },
          });
        }
      );
  }

  changeCount(quantity: number) {
    const request = {
      variant_id: this.product.defaultVariantId,
      quantity,
      special_instructions: '',
      storeId: this.product?.store?.id
    };

    this.productOrderService
      .updateCartProduct(request)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => {
          this.product.cartCount = this.cartCount;
          // this.productOrderService.updateCartCount(this.platformService.getCurrentServiceType());
          this.itemUpdated.emit(this.product);
          // this.toastService.presentToast('Item has been updated successfully.', 2000);
          if (this.cartCount === 0) {
            this.productOrderService.updateCartCount(
              this.platformService.getCurrentServiceType()
            );
          }
        },
        () => {
          this.toastService.presentToast(
            'Failed to update order. Please refresh.',
            2000,
            'danger'
          );
        }
      );
  }

  async showDifferentRestaurantModal() {
    const modalIsOpen = await this.modalController.getTop().then((res) => {
      if (res && res.id === 'empty-cart-modal') {
        return true;
      }
      return false;
    });
    if (modalIsOpen) {
      return false;
    }
    const msg =`Your cart contains items from another ${this.platformService.getCurrentServiceType() ? 'restaurant' : 'order'}. Would you like to discard previous items and add ${this.product.name}?`;
    const modal = await this.modalController.create({
      id: 'empty-cart-modal',
      component: CustomAlertComponent,
      cssClass: 'alert-modal',
      animated: false,
      componentProps: {
        title: 'Discard current items?',
        text: msg
      },
    });
    modal.onDidDismiss().then((res) => {
      if (res?.data?.status === 'confirm') {
        const currentServiceType = this.platformService.getCurrentServiceType();
        this.productService
          .removeCurrentItemsFromCart(currentServiceType)
          .pipe(takeUntil(this.destroyed$))
          .subscribe(
            () => {
              this.createProductOrder();
            },
            (err) => {
              this.toastService.presentToast(err.error.message, 2000, 'danger');
            }
          );
      }
    });
    return await modal.present();
  }


  public handleClick(): void {
    if(this.isFoodSearch) {
      this.navCtrl.navigateForward(['store', this.store?.id]);
    } else {
      if (this.isSearchItem) {
        this.navCtrl.navigateForward(['store', this.product?.storeId ?? this.product?.id]);
      } else {
        this.showOrderModal();
      }
    }
  }

  async showOrderModal(event: Event = null, isCreate: boolean = false) {
    if (event) {
      event.stopPropagation();
    }
    this.modal = await this.modalController.create({
      id: 'order-food-modal',
      component: OrderFoodComponent,
      componentProps: {
        isCreate,
        product: this.product,
        quantity: this.quantityForm.controls.quantity.value,
      },
    });
    return await this.modal.present();
  }

  async presentClosedAlert(): Promise<any> {
    let message = 'Food service unavailable today.';
    if (this.product.store.storeTimings.length > 0 && this.timing.isOpen) {
      const timeRange =
        this.utility.getLocalTime(this.timing.opensAt) +
        '-' +
        this.utility.getLocalTime(this.timing.closesAt);
      message = 'Food service is available during ' + timeRange;
    }
    const modal = await this.modalController.create({
      cssClass: 'alert-modal',
      component: CustomAlertWithImageComponent,
      animated: false,
      componentProps: {
        text: 'This restaurant is closed. But you can pre-order for later.',
        image: 'assets/pre-order-restaurant.svg'
      }
    })

    return await modal.present();
  }

  private getDistance(): void {
    this.getPickUpAddress();
    const startLocation = this.store?.defaultAddress?.geometry?.location;
    const endLocation = this.pickupAddress?.geometry?.location;

    this.getDurationDistance(startLocation, endLocation).then((res: any) => {
      this.restaurantDistance = res?.distance;
      this.restaurantDuration = res?.duration;
    });
  }

  public getDurationDistance(startLocation: any, endLocation: any): Promise<any> {
    const directionsService = new google.maps.DirectionsService();

    const request = {
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
    };

    return new Promise((resolve, reject) => {
      directionsService.route(
        request,
        (response: google.maps.DirectionsResult, status) => {
          const leg = response?.routes[0]?.legs[0];
          if (status === google.maps.DirectionsStatus.OK) {
            resolve({
              distance: leg?.distance.text,
              duration: leg?.duration.text,
            });
          }
        });
    });
  }

  public getPickUpAddress(): void {
    this.pickupAddressSubscription = this.dataService.pickUpAddress.subscribe((address) => {
      this.pickupAddress = address;
    });
  }

  public async openCustomizationModal(event: Event = null): Promise<any> {
    if (event) {
      event.stopPropagation();
    }
    const modal = await this.modalController.create({
      id: 'customization-modal',
      component: RepeatCustomFoodComponent,
      cssClass: "points-modal",
      initialBreakpoint: 1,
      animated: false,
      componentProps: {
        product: this.product,
      },
    });
    modal.onDidDismiss().then((res) => {
      // TODO:: handle response
    });
    return await modal.present();
  }

  public checkRepeatModal($event: Event): void {
    const isRepeat = this.product?.variants?.filter(variant => variant?.isRepeatedCustomization === true);

    if(this.product?.optionTypes?.length) {
      if(isRepeat?.length) {
        this.openCustomizationModal($event);
      } else {
        this.showOrderModal($event, true);
      }
    } else {
      this.createProductOrder($event);
    }
  }
}
