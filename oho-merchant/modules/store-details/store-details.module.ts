import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreDetailsPageRoutingModule } from './store-details-routing.module';

import { StoreDetailsPage } from './store-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { UiSharedModule } from 'src/app/ui-shared/ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreDetailsPageRoutingModule,
    SharedModule,
    UiSharedModule
  ],
  declarations: [StoreDetailsPage]
})
export class StoreDetailsPageModule {}
