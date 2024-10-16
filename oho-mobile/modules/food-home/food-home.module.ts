import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodHomePageRoutingModule } from './food-home-routing.module';

import { FoodHomePage } from './food-home.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CartPageModule } from '../cart/cart.module';
import { GoogleMapsComponent } from 'src/app/shared/components/google-maps/google-maps.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, FoodHomePageRoutingModule, SharedModule, CartPageModule],
  declarations: [FoodHomePage],
})
export class FoodHomePageModule {}
