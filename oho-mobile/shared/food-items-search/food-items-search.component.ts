import { Component, Input, OnInit } from '@angular/core';
import { Store } from 'src/app/models/store.model';
import { UtilityService } from 'src/app/services/utility.service';
import { OrderFoodComponent } from '../order-food/order-food.component';
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-food-items-search',
  templateUrl: './food-items-search.component.html',
  styleUrls: ['./food-items-search.component.scss'],
})
export class FoodItemsSearchComponent implements OnInit {
  @Input() store: any;

  constructor(
    public utility: UtilityService,
    private modalController: ModalController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  async showOrderModal(product: any) {
    const modal = await this.modalController.create({
      id: 'order-food-modal',
      component: OrderFoodComponent,
      componentProps: {
        product,
      },
    });
    return await modal.present();
  }

  public openStore(): void {
    this.navController.navigateForward(['store', this.store?.id]);
  }
}
