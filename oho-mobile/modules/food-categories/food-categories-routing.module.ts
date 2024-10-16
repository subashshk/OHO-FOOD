import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodCategoriesPage } from './food-categories.page';

const routes: Routes = [
  {
    path: '',
    component: FoodCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodCategoriesPageRoutingModule {}
