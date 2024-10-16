import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderMapPage } from './order-map.page';

const routes: Routes = [
  {
    path: '',
    component: OrderMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderMapPageRoutingModule {}
