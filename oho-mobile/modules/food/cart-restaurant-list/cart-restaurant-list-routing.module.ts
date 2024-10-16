import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CartRestaurantListPage } from './cart-restaurant-list.page';

const routes: Routes = [
  {
    path: '',
    component: CartRestaurantListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRestaurantListPageRoutingModule {}
