import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonModal, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Address } from 'src/app/models/address.model';
import { DataService } from 'src/app/services/data.service';
import { ProductOrderService } from 'src/app/services/product-order.service';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';
import { environment } from 'src/environments/environment';
import { Order, Step } from 'src/app/models/order.model';
import { plainToClass } from 'class-transformer';
import { OrderStatus } from '@globalEnums/order-status.enum';
import { PlatformService } from 'src/app/services/platform.service';
import { GoogleMapsComponent } from 'src/app/shared/components/google-maps/google-maps.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { PlatformServices } from '@globalEnums/services.enum';
import { HideTabsService } from 'src/app/services/hide-tabs.service';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
@Component({
  selector: 'app-order-map',
  templateUrl: './order-map.page.html',
  styleUrls: ['./order-map.page.scss'],
})
export class OrderMapPage extends subscribedContainerMixin() implements OnInit, OnDestroy {
  @ViewChild('modal')
  public orderDetailModal: IonModal;
  @Input() address: any;
  @ViewChild(GoogleMapsComponent, { static: false })
  mapsComponent: GoogleMapsComponent;

  public isFullBreakpoint: boolean = true;
  public apiKey: any = environment.googleMapsApiKey;
  private pickupAddressSubscription: Subscription;
  public riderLocationSubscription: Subscription;
  public pickupAddress: any;
  public dropOffAddress: any;
  public orderNumber: string = '';
  public pageNum: number = 1;
  public order: Order = new Order();
  public billingAddress: Address;
  public deliveryAddress: Address;
  public orderStatus: OrderStatus;
  public smallBreakpoint: number = 0.21;
  public initialBP: number = 0.99;
  public backSubscription: Subscription;
  private scrollTop: number = 0;
  public isPlaced: boolean = false;
  public currentServiceType: PlatformServices;
  public estTimeForOrder: string = '';
  public step: Step = {
    placed: '', // Initially empty
    processing: '',
    pickedUpForDelivery: '',
    delivered: ''
  };
  public stepper: any = {};
  private breakpoint: Record<any, number> = {
    small: 0.25,
    medium: 0.22,
    large: 0.21
  }

  public isAddress = false;
  public addressId = 0;
  public showBack: boolean = false;
  public isCart: boolean = false;

  constructor(
    public activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private dataService: DataService,
    private productOrderService: ProductOrderService,
    private platform: Platform,
    private platformService: PlatformService,
    private firestore: AngularFirestore,
    private hideTabsService: HideTabsService,
    private platformServices: PlatformService,
    private globalEmitterService: GlobalEmitterService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.currentServiceType = this.platformService.getCurrentServiceType();
    this.setBreakpointForSmallPopup();
    this.backButtonEvent();
    this.isFullBreakpoint = true;
    this.isCart = this.productOrderService.foodCheckoutVariables?.isCart;
  }

  ionViewWillEnter(): void {
    this.setOrderNumber();
    this.platform.resume.subscribe(() => {
      this.orderDetailModal.setCurrentBreakpoint(this.initialBP);
    });
  }

  ngOnDestroy(): void {
    if (this.pickupAddressSubscription) {
      this.pickupAddressSubscription.unsubscribe();
    }
    if (this.backSubscription) {
      this.backSubscription.unsubscribe();
    }

    if (this.riderLocationSubscription) {
      this.riderLocationSubscription.unsubscribe();
    }
    this.orderDetailModal?.dismiss();
  }

  public break(event: any): void {
    if (event.detail.breakpoint === 0.99) {
      this.isFullBreakpoint = true;
    } else {
      this.isFullBreakpoint = false;
      this.setPathOnMap(this.pickupAddress, this.dropOffAddress, this.step.delivered ? 'assets/images/market-location.svg' : null);
    }

  }

  public goBack(event: any = null): void {
    if (event == 'home') {
      this.navCtrl.navigateBack('tabs/home');
    } else {
      this.navCtrl.back();
    }
    setTimeout(() => {
      this.orderDetailModal?.dismiss();
    }, 200);
    this.globalEmitterService.setCurrentServiceTypeHome.emit();
    this.showBack = false;
  }

  public changeBreakpoint(event: number): void {
    if (event === 0.99) {
      this.orderDetailModal.setCurrentBreakpoint(0.99);
    } else {
      this.orderDetailModal.setCurrentBreakpoint(this.smallBreakpoint);
    }
  }

  public setOrderNumber(): void {
    if (this.activatedRoute.snapshot.params.id) {
      this.orderNumber = this.activatedRoute.snapshot.params.id;
      this.pageNum = 1;
      this.updateProductsList();
    }
  }

  public updateProductsList(): void {
    this.productOrderService
      .getProductsFromOrder(this.orderNumber, this.pageNum)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.order = plainToClass(Order, res.data.order);
          this.orderStatus = res.data.status;
          this.step = this.productOrderService.getStepperStatus(this.order?.orderStatusDetail);
          this.isPlaced = !this.step.processing && !this.step.pickedUpForDelivery && !this.step.delivered;
          this.stepper = {
            "step": this.step,
            "isPlaced": this.isPlaced,
            "isProcessing": this.step.processing && !this.step.pickedUpForDelivery && !this.step.delivered,
            "isPickedForDelivery": this.step.pickedUpForDelivery && !this.step.delivered,
            "isDelivered": !this.step.placed && !this.step.processing && !this.step.pickedUpForDelivery && !this.step.delivered,
          };
          if (this.order.billAddress) {
            this.billingAddress = this.order.billAddress;
          }
          if (this.order.shipAddress) {
            this.deliveryAddress = this.order.shipAddress;
            this.addressId = this.order?.shipAddress?.id;
          }

          if (this.order.rideRequest) {
            this.pickupAddress = this.order.rideRequest?.pickUp?.geometry?.location;
            this.dropOffAddress = this.order.rideRequest?.dropOff?.geometry?.location;
            const imgIfDelivered = this.step.delivered ? 'assets/images/market-location.svg' : null
            this.setPathOnMap(this.pickupAddress, this.dropOffAddress, imgIfDelivered);
            if (!this.step.delivered) {
              this.getRiderLocation();
            }
          }
        }
      });
  }

  private setPathOnMap(pickupAddress: Address, dropOffAddress: Address, endIcon = null): void {
    if (this.mapsComponent) {
      this.mapsComponent.startLocation = pickupAddress;
      this.mapsComponent.endLocation = dropOffAddress;

      this.mapsComponent.createDirectionMap().then((res) => {
        this.estTimeForOrder = this.convertSeconds(res?.durationInSeconds);
        const directionIcons = {
          start: 'assets/images/mart-pickup.svg',
          end: endIcon ?? 'assets/images/mart-marker.svg',
        };

        this.mapsComponent.addDirectionsMarkerMartFood(res.leg, directionIcons);
        this.hideTabsService.setRideInfo(false);
      });
    }
  }

  private setBreakpointForSmallPopup(): void {
    this.smallBreakpoint = this.platformServices.getStyles(this.breakpoint);
  }

  private backButtonEvent(): void {
    this.backSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.goBack();
    });
  }

  public updateScroll(scrollNum: number): void {
    this.scrollTop = scrollNum;
  }

  public touchMoved(event: Event, isDetail: boolean = false): void {
    if (isDetail && (this.scrollTop || this.orderStatus === OrderStatus.Draft || !this.step.pickedUpForDelivery || this.step.delivered)) {
      event.stopPropagation();
    }
  }


  public getRiderLocation(): void {
    const riderLocation = this.firestore
      .collection('rider')
      .doc(this.order?.rideRequest?.riderId.toString())
      .valueChanges();

    this.riderLocationSubscription = riderLocation.subscribe((res: any) => {
      if (res?.position) {
        this.mapsComponent.removeRiderMarkers();
        this.mapsComponent.moveRiderMarkerWithLocation(
          res?.position,
          this.currentServiceType === PlatformServices.Mart ? 'assets/images/market-location.svg' : 'assets/images/restaurant-location.svg'
        );
      }
    });
  }

  private convertSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.ceil(seconds / 60).toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  goto(): void {
    this.isAddress = true;
  }

  setAddress(): void {
    this.isAddress = false;
  }

  setAddressId(id: number) {
    this.addressId = id;
  }

  public showBackBtn(): void {
    this.showBack = true;
  }
}
