import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomePageRoutingModule } from './home-routing.module';
import { CartPageModule } from '../cart/cart.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CartPageModule,
    SharedModule,
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
