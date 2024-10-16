import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartRestaurantListPageRoutingModule } from './cart-restaurant-list-routing.module';

import { CartRestaurantListPage } from './cart-restaurant-list.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { UiSharedModule } from 'src/app/ui-shared/ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartRestaurantListPageRoutingModule,
    SharedModule,
    UiSharedModule
  ],
  declarations: [CartRestaurantListPage]
})
export class CartRestaurantListPageModule {}
