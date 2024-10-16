import { Component, Input, OnInit } from '@angular/core';
import { PlatformServices } from '@globalEnums/services.enum';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Store } from 'src/app/models/store.model';
import { UtilityService } from 'src/app/services/utility.service';
import { CustomAlertWithImageComponent } from '../../components/custom-alert-with-image/custom-alert-with-image.component';
import { Address } from 'src/app/models/address.model';
/// <reference types="@types/googlemaps" />
declare const google: any;

@Component({
  selector: 'app-restaurant-item',
  templateUrl: './restaurant-item.component.html',
  styleUrls: ['./restaurant-item.component.scss'],
})
export class RestaurantItemComponent implements OnInit {
  @Input() restaurant: Store;
  @Input() pickAddress: Address;
  @Input() isSlideItem = false;
  @Input() isLoading: boolean = false;
  public restaurantDistance: string;
  public restaurantDuration: string;


  public platformServices = PlatformServices;

  get timing() {
    const currentDate = new Date();
    const currentDay = currentDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const timing = this.restaurant.storeTimings[this.restaurant.storeTimings.findIndex((timing) => currentDay === timing.day)];
    return timing;
  }

  constructor(
    private navCtrl: NavController,
    public utility: UtilityService,
    private alertController: AlertController,
    private modalController: ModalController,
  ) { }

  ngOnInit(): void {
    this.getDistance();
  }

  navigateToStore(storeId: number) {
    if (!this.restaurant.storeIsOpen) {
      this.presentClosedAlert();
    }
    this.navCtrl.navigateForward('store/' + storeId);
  }

  async presentClosedAlert(): Promise<any> {
    let message = 'Food service unavailable today.';
    if (this.restaurant.storeTimings.length > 0 && this.timing.isOpen) {
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
    const startLocation = this.restaurant?.defaultAddress?.geometry?.location;
    const endLocation = this.pickAddress?.geometry?.location;

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
}
