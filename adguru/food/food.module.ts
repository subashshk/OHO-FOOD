import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodRoutingModule } from './food.routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { MainComponent } from './pages/main/main.component';
import { FoodDashboardComponent } from './pages/food-dashboard/food-dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { OhoModule } from '../oho/oho.module';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ProductsPageComponent } from './pages/products-page/products-page.component';
import { StoresPageComponent } from './pages/stores-page/stores-page.component';
import { SpotlightStoreListingComponent } from './components/spotlight-store-listing/spotlight-store-listing.component';
import { FoodSalesOverTimeComponent } from './components/food-sales-over-time/food-sales-over-time.component';
import { ReportFilterBarComponent } from './misc/report-filter-bar/report-filter-bar.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { SalesByProductComponent } from './components/sales-by-product/sales-by-product.component';
import { SalesByCategoryComponent } from './components/sales-by-category/sales-by-category.component';
import { FormsModule } from '@angular/forms';
import { RiderAdminModule } from '../rider-admin/rider-admin.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AdminModule } from '../admin/admin.module';

@NgModule({
  declarations: [
    FoodDashboardComponent,
    MainComponent,
    OrdersPageComponent,
    ProductsPageComponent,
    StoresPageComponent,
    SpotlightStoreListingComponent,
    FoodSalesOverTimeComponent,
    ReportFilterBarComponent,
    SalesByProductComponent,
    SalesByCategoryComponent,
  ],
  imports: [
    CommonModule,
    FoodRoutingModule,
    SharedModule,
    NgApexchartsModule,
    NzSelectModule,
    OhoModule,
    NzTableModule,
    NzDatePickerModule,
    FormsModule,
    RiderAdminModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSwitchModule,
    AdminModule
  ],
  exports: [
    FoodDashboardComponent,
    MainComponent,
    OrdersPageComponent,
    ProductsPageComponent,
    StoresPageComponent,
    SpotlightStoreListingComponent,
    FoodSalesOverTimeComponent,
    ReportFilterBarComponent,
    SalesByProductComponent,
    SalesByCategoryComponent,
  ]
})
export class FoodModule { }
