import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdersPage } from './orders.page';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: OrdersPage }]),
    SharedModule,
  ],
  declarations: [OrdersPage],
})
export class OrdersPageModule {}
