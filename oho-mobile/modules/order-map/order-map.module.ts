import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderMapPageRoutingModule } from './order-map-routing.module';

import { OrderMapPage } from './order-map.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderMapPageRoutingModule,
    SharedModule
  ],
  declarations: [OrderMapPage]
})
export class OrderMapPageModule {}
