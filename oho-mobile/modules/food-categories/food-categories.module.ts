import { CartPageModule } from './../cart/cart.module';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodCategoriesPageRoutingModule } from './food-categories-routing.module';

import { FoodCategoriesPage } from './food-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoodCategoriesPageRoutingModule,
    SharedModule,
    CartPageModule
  ],
  declarations: [FoodCategoriesPage]
})
export class FoodCategoriesPageModule {}
