import { PlatformServices } from './../../../enums/services.enum';
import { UtilityService } from './../../../services/utility.service';
import { NavController } from '@ionic/angular';
import { Store } from './../../../models/store.model';
import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Address } from 'src/app/models/address.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.scss'],
})
export class RestaurantListComponent implements OnInit {
  @Input() restaurants: Store[] = [];
  @Input() isLoading: boolean = false;

  public pickupAddress: Address;
  public pickupAddressSubscription: Subscription;

  constructor(
    private navCtrl: NavController,
    public utility: UtilityService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.getPickUpAddress();
  }

  ngOnDestroy(): void {
    if (this.pickupAddressSubscription) {
      this.pickupAddressSubscription.unsubscribe();
    }
  }

  navigateTo(url: string) {
    this.navCtrl.navigateForward(url);
  }

  get platformServices(): any {
    return PlatformServices;
  }

  public getPickUpAddress(): void {
    this.pickupAddressSubscription = this.dataService.pickUpAddress.subscribe((address) => {
      this.pickupAddress = address;
    });
  }

}
