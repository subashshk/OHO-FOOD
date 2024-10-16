import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MainComponent } from "./pages/main/main.component";
import { FoodDashboardComponent } from "./pages/food-dashboard/food-dashboard.component";
import { OrdersPageComponent } from "./pages/orders-page/orders-page.component";
import { ProductsPageComponent } from "./pages/products-page/products-page.component";
import { StoresPageComponent } from "./pages/stores-page/stores-page.component";
import { AllBannersComponent } from "../admin/pages/banners/components/all-banners/all-banners.component";
import { BannerTypesComponent } from "../admin/pages/banners/components/banner-types/banner-types.component";
import { BannerListComponent } from "../admin/pages/banners/components/banner-list/banner-list.component";
import { StoreSectionsComponent } from "../admin/pages/store-sections/store-sections.component";
import { ListStoreRequestsComponent } from "../admin/pages/store-sections/components/list-store-requests/list-store-requests.component";
import { SpotlightStoreListingComponent } from "./components/spotlight-store-listing/spotlight-store-listing.component";
import { DeliveryOptionsComponent } from "../admin/pages/delivery-options/delivery-options.component";
import { TaxonomiesComponent } from "../admin/pages/taxonomies/taxonomies.component";
import { TaxonsComponent } from "../admin/pages/taxons/taxons.component";
import { AllDealsComponent } from "../admin/pages/deals/components/all-deals/all-deals.component";
import { ListStoresComponent } from "../admin/pages/deals/components/list-stores/list-stores.component";
import { ListProductsComponent } from "../admin/pages/deals/components/list-products/list-products.component";
import { OHORouteData } from "@globalEnums/oho-route-data.enum";
import { FoodSalesOverTimeComponent } from "./components/food-sales-over-time/food-sales-over-time.component";
import { SalesByProductComponent } from "./components/sales-by-product/sales-by-product.component";
import { SalesByCategoryComponent } from "./components/sales-by-category/sales-by-category.component";
import { RoutePath } from "./enums/food.enum";
import { EditDealComponent } from "../admin/pages/deals/components/edit-deal/edit-deal.component";
import { PlatformServices } from "@globalEnums/services.enum";

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: FoodDashboardComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'orders',
        component: OrdersPageComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'products',
        component: ProductsPageComponent
      },
      {
        path: 'stores',
        component: StoresPageComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'all-banners',
        component: AllBannersComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'banners-section',
        component: BannerTypesComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'banners-section/:id',
        component: BannerListComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'store-section',
        component: StoreSectionsComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'store-section/:id',
        component: SpotlightStoreListingComponent,
      },
      {
        path: 'delivery-options',
        component: DeliveryOptionsComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'taxonomies',
        component: TaxonomiesComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'taxonomies/taxon-categories/:id',
        component: TaxonsComponent,
        data: {
          routeData: OHORouteData.Food
        },
      },
      {
        path: 'deals',
        component: AllDealsComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'deals/edit/:id',
        component: EditDealComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'deals/merchant-store-listing/:id',
        component: ListStoresComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'deals/merchant-products/:id',
        component: ListProductsComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'deals/edit/:id',
        component: AllDealsComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'sales-over-time',
        component: FoodSalesOverTimeComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'sales-by-product',
        component: SalesByProductComponent,
        data: {
          routeData: OHORouteData.Food
        }
      },
      {
        path: 'sales-by-category',
        component: SalesByCategoryComponent,
        data: {
          routeData: {
            serviceType: PlatformServices.Food,
            path: RoutePath.Category
          }
        }
      },
      {
        path: 'sales-by-vendor',
        component: SalesByCategoryComponent,
        data: {
          routeData: {
            serviceType: PlatformServices.Food,
            path: RoutePath.Vendor
          }
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FoodRoutingModule {}
