import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { ToastService } from 'src/app/services/toast.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Address } from 'src/app/models/address.model';
import { Setting } from 'src/app/models/setting.model';
import { Subscription } from 'rxjs';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';
import { takeUntil } from 'rxjs/operators';
import { RideRequest } from 'src/app/models/ride-request.model.';
import { VehicleType } from 'src/app/models/vehicle-type.model';
import { VehicleService } from 'src/app/services/vehicle.service';
import { LocationService } from 'src/app/services/location.service';
import { SettingService } from 'src/app/services/setting.service';
import { Shipment } from 'src/app/models/shipment.model';
import { OrderService } from 'src/app/services/order.service';
import { ModalController } from '@ionic/angular';
import { ModalId } from '../../enums/modal-id.enum';

@Component({
  selector: 'app-ride-selector',
  templateUrl: './ride-selector.component.html',
  styleUrls: ['./ride-selector.component.scss']
})
export class RideSelectorComponent extends subscribedContainerMixin() implements OnInit {
  slideOpts = {
    slidesPerView: 3.5,
    spaceBetween: 10,
    freeMode: true,
    pager: false,
  };

  isLoading = true;
  isAssigningRiders = false;
  sentPickUpRequest = false;
  vehicleTypes: VehicleType[] = [];
  availableRiders = [];
  setting: Setting;
  pickupAddressSubscription: Subscription;
  pickupAddress: Address;
  dropoffAddressSubscription: Subscription;
  dropoffAddress: Address;
  requestId: number;
  fetchingAvailableRiders = false;
  isSearchingForRiders = false;

  @Input() distanceInKm: number;
  @Input() order: Shipment;
  @Input() selectedVehicleType: VehicleType;
  @Input() routeDistanceInKm: number;

  @Output() vehicleTypeEmitter = new EventEmitter();
  @Output() assignComplete = new EventEmitter();
  @Output() availableRidersEmitter = new EventEmitter();

  constructor(
    public utility: UtilityService,
    private vehicleService: VehicleService,
    private toastService: ToastService,
    private locationService: LocationService,
    private settingsService: SettingService,
    private orderService: OrderService,
    private modalController: ModalController
  ) {
    super();
  }

  ngOnInit() {
    this.setVehicleFares();
  }

  setVehicleFares = (): void => {
    this.vehicleService
      .getVehicleFares(this.distanceInKm)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.vehicleTypes = [];
          res.data.data.forEach((vehicleType) => {
            this.vehicleTypes.push(plainToClass(VehicleType, vehicleType));
          });
          this.setMaximumRadius();
        },
        (err) => {
          this.toastService.presentToast(err.error.message, 2000, 'danger');
        }
      );
  }

  setMaximumRadius = (): void => {
    this.settingsService
      .getSettings()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.setting = res.data;
        }
        if (this.vehicleTypes.length > 0) {
          this.selectVehicleType(this.vehicleTypes[0]);
        }
        this.isLoading = false;
      });
  }

  selectVehicleType = (vehicleType: VehicleType): void => {
    if (this.sentPickUpRequest) {
      return;
    }
    this.fetchingAvailableRiders = true;
    this.selectedVehicleType = vehicleType;
    this.vehicleTypeEmitter.emit(vehicleType);
    this.locationService
      .getAvailableRiders(this.selectedVehicleType.id, this.setting.driverRadius, this.order.storeAddress)
      .then((riderDocs) => {
        this.availableRiders = riderDocs;
        this.availableRidersEmitter.emit(this.availableRiders);
        this.fetchingAvailableRiders = false;
      });
  }

  assignRiders = (): void => {
    if (this.fetchingAvailableRiders) {
      this.toastService.presentToast('Please wait. We are searching for available riders.', 2000);
      return;
    }

    if (this.availableRiders.length === 0) {
      this.toastService.presentToast('No riders available with the vehicle at this time.', 2000, 'danger');
      return;
    }

    this.isAssigningRiders = true;
    const riderIds = [];
    this.availableRiders.forEach((rider) => {
      riderIds.push(rider.get('riderId'));
    });
    this.orderService.assignRiders(this.order.id, riderIds, this.routeDistanceInKm).pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      if (res.data) {
        this.assignComplete.emit();
      }
    }, (err) => {
      this.toastService.presentToast(err.error.message, 2000, 'danger');
    });
  }
}
