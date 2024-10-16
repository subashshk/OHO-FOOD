import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { plainToClass } from 'class-transformer';
import { takeUntil } from 'rxjs/operators';
import { Setting } from 'src/app/models/setting.model';
import { Shipment } from 'src/app/models/shipment.model';
import { User } from 'src/app/models/user.model';
import { LocationService } from 'src/app/services/location.service';
import { MapsService } from 'src/app/services/maps.service';
import { OrderService } from 'src/app/services/order.service';
import { SettingService } from 'src/app/services/setting.service';
import { ToastService } from 'src/app/services/toast.service';
import { UtilityService } from 'src/app/services/utility.service';
import { MapViewModalComponent } from 'src/app/shared/components/map-view-modal/map-view-modal.component';
import { RateRiderComponent } from 'src/app/shared/components/rate-rider/rate-rider.component';
import { DeliveryStatus } from 'src/app/shared/enums/delivery-status.enum';
import { OrderStatus } from 'src/app/shared/enums/order-status.enum';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage extends subscribedContainerMixin() implements OnInit {
  shipmentNumber: string;
  public orderDetails: Shipment = new Shipment();

  isLoading: boolean;
  isCancellingOrder: boolean;
  isConfirmingOrder: boolean;
  isShippingOrder: boolean;
  isChoosingRider: boolean;
  isAssigningRider: boolean;
  isAssigningClosestRiders: boolean;
  isConfirmingPayment: boolean;
  isRatingRider: boolean;
  isPayingRider: boolean;

  assignedRiderId: any;

  riderPerPage = 15;
  riderTotalCount: number;
  riderCurrentPage = 1;
  riders: User[] = [];

  rating: number;
  review: string;

  deliveryCancelled: boolean;
  riderLoading: boolean;
  setting: Setting;
  routeDistanceInKm: number;

  constructor(
    private route: ActivatedRoute,
    private modalController: ModalController,
    public utility: UtilityService,
    public orderService: OrderService,
    private toastService: ToastService,
    private alertController: AlertController,
    private locationService: LocationService,
    private settingService: SettingService,
    private mapsService: MapsService,
    private navCtrl: NavController
  ) {
    super();
  }

  get orderStatus(): any {
    return OrderStatus;
  }

  get isOrderDeliveredAndPaid(): boolean {
    if (
      this.orderDetails.status === OrderStatus.Delivered &&
      this.orderDetails.payment &&
      this.orderDetails.payment.state !== 'pending'
    ) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.shipmentNumber = this.route.snapshot.paramMap.get('id');
    this.setOrderDetails();
  }

  public goBack(): void {
    this.navCtrl.back();
  }

  setOrderDetails(): void {
    this.isLoading = true;
    this.orderService
      .getOrderDetails(this.shipmentNumber)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.orderDetails = plainToClass(Shipment, res.data);
          this.setRouteDistance();
          this.setSetting();
        },
        (err) => {
          this.setSetting();
        }
      );
  }

  setRouteDistance = (): void => {
    this.mapsService
      .getDirectionsResult(
        this.orderDetails.storeAddress?.geometry?.location,
        this.orderDetails.shipAddress?.geometry?.location
      )
      .then((res: google.maps.DirectionsResult) => {
        this.routeDistanceInKm = res.routes[0].legs[0].distance.value / 1000;
      });
  };

  setSetting = (): void => {
    this.settingService
      .getSettings()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success) {
            this.setting = res.data;
          }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
        }
      );
  };

  confirmOrder(): void {
    this.isConfirmingOrder = true;
    this.orderService
      .confirmShipment(this.orderDetails.shipmentNumber)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res && res.success) {
            this.setOrderDetails();
            this.toastService.presentToast('The order has been confirmed.', 2000, 'success');
          } else {
            this.toastService.presentToast(res.message, 2000, 'success');
          }
          this.isConfirmingOrder = false;
        },
        (err) => {
          this.isConfirmingOrder = false;
          this.toastService.presentToast('Something went wrong', 2000, 'error');
        }
      );
  }

  async showCancelConfirmation(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'alert-modal-class',
      header: 'Cancel Confirmation',
      message: 'Are you sure you want to cancel this shipment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'btn btn-no',
        },
        {
          cssClass: 'btn btn-yes',
          text: 'Confirm',
          handler: () => {
            this.cancelOrder();
          },
        },
      ],
    });

    await alert.present();
  }

  async showConfirmAlert(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'alert-modal-class',
      header: 'Confirm Shipment',
      message: 'Are you sure you want to confirm this shipment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'btn btn-no',
        },
        {
          cssClass: 'btn btn-yes',
          text: 'Confirm',
          handler: () => {
            this.confirmOrder();
          },
        },
      ],
    });

    await alert.present();
  }

  cancelOrder(): void {
    this.isCancellingOrder = true;
    this.orderService
      .cancelShipment(this.orderDetails.shipmentNumber)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res && res.success) {
            this.setOrderDetails();
            this.isCancellingOrder = false;
            this.toastService.presentToast('The order has been cancelled.', 2000, 'success');
          }
        },
        (err) => {
          this.isCancellingOrder = false;
          this.toastService.presentToast('Something went wrong', 2000, 'error');
        }
      );
  }

  assignRider = (): void => {
    if (!this.assignedRiderId) {
      this.toastService.presentToast('Please select at least one rider.', 2000, 'danger');
      return;
    }
    this.isAssigningRider = true;
    this.orderService
      .assignRiders(this.orderDetails.id, [this.assignedRiderId], this.routeDistanceInKm)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.data) {
          this.processRiderAssignSuccess();
        }
      });
  };

  processRiderAssignSuccess = (): void => {
    this.toastService.presentToast('Request has been sent to rider.', 2000, 'success');
    this.isAssigningRider = false;
    this.isChoosingRider = false;
    this.setOrderDetails();
  };

  chooseRider(): void {
    this.riders = [];
    this.riderLoading = true;
    this.isChoosingRider = true;
    this.getRiders();
  }

  selectRider(item: User): void {
    this.assignedRiderId = item.id;
  }

  getMoreRiders(event: any): void {
    this.riderCurrentPage += 1;
    this.getRiders(event);
  }

  getRiders(event = null): void {
    this.orderService
      .getRiders(this.riderPerPage, this.riderCurrentPage, 'order_delivery')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.data.data) {
          this.riderTotalCount = res.data.totalCount;
          res.data.data.forEach((element) => {
            this.riders.push(plainToClass(User, element));
          });
          if (event) {
            event.target.complete();
            if (this.riders.length === this.riderTotalCount) {
              event.target.disabled = true;
            }
          }
          this.riderLoading = false;
        }
      });
  }

  confirmPayment(): void {
    this.isConfirmingPayment = true;
    this.orderService
      .confirmPayment(this.orderDetails.shipmentNumber)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.toastService.presentToast(res.message, 2000, 'success');
          this.showRating();
        }
        this.isConfirmingPayment = false;
      });
  }

  async showPaymentConfirmation(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'alert-modal-class',
      header: 'Payment Confirmation',
      message:
        'Did you receive payment for order ID: <strong>' +
        this.shipmentNumber +
        '</strong> ? <br> Please, note you cannot undo this action.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'btn btn-no',
        },
        {
          cssClass: 'btn btn-yes',
          text: 'Confirm',
          handler: () => {
            this.confirmPayment();
          },
        },
      ],
    });

    await alert.present();
  }

  async riderPaymentConfirm(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'alert-modal-class',
      header: 'Payment Confirmation',
      message: 'Are you sure you want to pay?' + '<br> Please, note you cannot undo this action.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'btn btn-no',
        },
        {
          cssClass: 'btn btn-yes',
          text: 'Confirm',
          handler: () => {
            this.payToRider();
          },
        },
      ],
    });

    await alert.present();
  }

  async showRating(): Promise<void> {
    this.rating = 0;
    this.review = '';
    const modal = await this.modalController.create({
      component: RateRiderComponent,
      cssClass: 'rider-modal-class',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.rating = dataReturned.data.rate;
        this.review = dataReturned.data.review;
        this.rateRider();
      }
    });

    return await modal.present();
  }

  rateRider(): void {
    this.isRatingRider = true;
    this.orderService
      .rateRider(
        this.orderDetails.rideRequest.rider.id,
        this.rating,
        this.review,
        this.orderDetails.id,
        this.orderDetails.rideRequest.deliveryId
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.toastService.presentToast('Rider has been rated', 2000, 'success');
        } else {
          this.toastService.presentToast(res.message, 2000, 'error');
        }
        this.isRatingRider = false;
        this.setOrderDetails();
      });
  }

  async mapView(
    isUser = false,
    showVehicleSelector = false,
    showDropOffMarker = true
  ): Promise<void> {
    const modal = await this.modalController.create({
      component: MapViewModalComponent,
      componentProps: {
        id: 'map-modal',
        storeAddress: this.orderDetails.storeAddress ? this.orderDetails.storeAddress : '',
        shipAddress: this.orderDetails.shipAddress ? this.orderDetails.shipAddress : '',
        showDirection: !isUser,
        rider:
          this.orderDetails.rideRequest && this.orderDetails.rideRequest.rider
            ? this.orderDetails.rideRequest.rider
            : null,
        status: this.orderDetails.rideRequest ? this.orderDetails.rideRequest.status : '',
        deliveryId: isUser ? null : this.orderDetails.rideRequest?.id,
        showDropOffMarker,
        showVehicleSelector,
        order: this.orderDetails,
        routeDistanceInKm: this.routeDistanceInKm,
      },
    });
    modal.onDidDismiss().then((res) => {
      if (res.data.assignComplete) {
        this.processRiderAssignSuccess();
      }
    });
    return await modal.present();
  }

  getPaymentStatus(): string {
    if (this.orderDetails.payment && this.orderDetails.payment.state === 'paid') {
      return 'Paid';
    }
    return 'Unpaid';
  }

  getRiderImage(): string {
    if (this.orderDetails && this.orderDetails.rideRequest && this.orderDetails.rideRequest.rider) {
      return this.utility.getImage(this.orderDetails.rideRequest.rider.profilePictureMini);
    }
  }

  payToRider(): void {
    this.isPayingRider = true;
    this.orderService
      .payToRider(this.orderDetails.rideRequest.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.setOrderDetails();
          this.toastService.presentToast('Payment to rider successful', 2000, 'success');
          this.isPayingRider = false;
        }
      });
  }

  get showButtons(): boolean {
    switch (this.orderDetails.status) {
      case OrderStatus.Cancelled:
        return false;
      case OrderStatus.Pending:
        return true;
      case OrderStatus.Ready:
        if (!this.orderDetails.rideRequest) {
          return true;
        } else {
          if (this.orderDetails.rideRequest.status === DeliveryStatus.Cancelled) {
            return true;
          } else if (this.orderDetails.rideRequest.status === DeliveryStatus.Pending) {
            return false;
          } else {
            if (this.orderDetails.rideRequest.riderPayment.state === 'paid') {
              return false;
            }
            return true;
          }
        }
      case OrderStatus.Shipping:
        if (this.orderDetails.rideRequest.riderPayment.state === 'paid') {
          return false;
        }
        return true;
      case OrderStatus.Delivered:
        if (
          this.orderDetails.rideRequest &&
          (this.orderDetails.rideRequest.riderPayment.state !== 'paid' ||
            this.orderDetails.payment.state !== 'paid')
        ) {
          return true;
        }
        return false;
    }
  }

  showShipButton(): boolean {
    if (this.orderDetails.status === OrderStatus.Ready) {
      if (this.orderDetails.rideRequest) {
        if (
          this.orderDetails.rideRequest.status === DeliveryStatus.Cancelled ||
          this.orderDetails.rideRequest.status === DeliveryStatus.Rejected
        ) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  showPayToRider(): boolean {
    if (this.orderDetails.rideRequest) {
      if (
        this.orderDetails.rideRequest.status === DeliveryStatus.Cancelled ||
        this.orderDetails.rideRequest.status === DeliveryStatus.Rejected ||
        this.orderDetails.rideRequest.status === DeliveryStatus.Pending
      ) {
        return false;
      } else {
        if (this.orderDetails.rideRequest.riderPayment.state !== 'paid') {
          return true;
        }
        return false;
      }
    }
    return false;
  }

  viewClosestRiders = (): void => {
    this.mapView(false, true, false);
  };
}
