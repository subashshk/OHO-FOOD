import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDetailPageRoutingModule } from './order-detail-routing.module';

import { OrderDetailPage } from './order-detail.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicRatingModule } from 'ionic-rating';
import { UiSharedModule } from 'src/app/ui-shared/ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderDetailPageRoutingModule,
    SharedModule,
    IonicRatingModule,
    UiSharedModule
  ],
  declarations: [OrderDetailPage],
})
export class OrderDetailPageModule {}
