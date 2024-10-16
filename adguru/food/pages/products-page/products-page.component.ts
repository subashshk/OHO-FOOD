import { Component, OnInit } from '@angular/core';
import { ProductStatus } from '../../enums/food.enum';
import { FoodService } from '../../services/food.service';
import { finalize } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { RangeType } from '@globalEnums/range-type.enum';
import { PlatformServices } from '@globalEnums/services.enum';
import { ActivatedRoute } from '@angular/router';
import { OHORouteData } from '@globalEnums/oho-route-data.enum';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit {
  public breadcrumbs: {
    name: string;
    route: string;
  }[] = [
    { name: 'Products', route: '' },
    { name: 'All Products', route: '' },
  ]
  public perPage: number = 10;
  public pageIndex: number = 1;
  public isLoading: boolean = false;
  public statusFilter: string;
  public totalCount: number = 10;
  public showFilter: boolean = false;
  public searchStr: string;
  public prodStatus: typeof ProductStatus = ProductStatus;
  public orderStatusSelect: any = {
    placeholder: 'Status Filter: All',
    options: [
      { label: 'New', value: ProductStatus.New },
      { label: 'Blocked', value: ProductStatus.Blocked },
      { label: 'Active', value: ProductStatus.Active },
      { label: 'Inactive', value: ProductStatus.Inactive}
    ]
  }
  public rangeFilter: Date[];
  public ranges: any = {
    'Today ': this.utility.getPresetRange(RangeType.Today),
    'Yesterday ': this.utility.getPresetRange(RangeType.Yesterday),
    'Last 7 Days': this.utility.getPresetRange(RangeType.Last7Days),
    'This Month': this.utility.getPresetRange(RangeType.ThisMonth),
    'Last Month': this.utility.getPresetRange(RangeType.LastMonth),
    'Last 6 Months': this.utility.getPresetRange(RangeType.Last6Months),
    'This Year': this.utility.getPresetRange(RangeType.ThisYear),
    'Last Year': this.utility.getPresetRange(RangeType.LastYear),  };
  public productsList: any[] = [];
  public serviceType: string = PlatformServices.Food;

  constructor(
    private service: FoodService,
    private notification: NzNotificationService,
    private utility: UtilityService,
    private activteRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.rangeFilter = this.utility.getPresetRange(RangeType.ThisMonth);
    this.checkRoute();
    this.getAllProducts()
  }

  public toggleFilter = (filterFlag: boolean): void => {
    this.showFilter = filterFlag;
  }

  public handleSearchString = (str: string): void => {
    this.searchStr = str;
    this.getAllProducts();
  }

  public resetFilter = (): void => {
    this.statusFilter = null;
    this.getAllProducts();
  }

  public handleFilter = (filterStr: string): void => {
    this.statusFilter = filterStr;
    this.getAllProducts();
  }

  public pageChangeHandler = (pageNumber: number): void => {
    this.pageIndex = pageNumber;
    this.getAllProducts();
  }

  public perPageChanged = (perPage: number): void => {
    this.perPage = perPage;
    this.pageIndex = 1;
    this.getAllProducts();
  }

  public setDateRange = (range: Date[]): void => {
    this.rangeFilter = range;
    if (this.rangeFilter.length > 0) {
      this.getAllProducts();
    }
  }

  public getAllProducts = (): void => {
    this.isLoading = true;
    this.service.getAllProducts(
      this.perPage,
      this.pageIndex,
      this.statusFilter,
      this.rangeFilter,
      this.serviceType,
      this.searchStr
    )
    .pipe(finalize(() => {
      this.isLoading = false;
    }))
    .subscribe(res => {
      if (res?.success) {
        this.productsList = res?.data?.data;
        this.totalCount = res?.data?.totalCount;
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An unexpected error occured'
      );
    });
  }

  public checkRoute = (): void => {
    this.activteRoute.data.subscribe(data => {
      let routeData = data?.routeData;
      if (routeData === OHORouteData.Food) {
        this.serviceType = PlatformServices.Food;
      }
      if (routeData === OHORouteData.Mart) {
        this.serviceType = PlatformServices.Mart;
      }
      if (routeData === OHORouteData.Mall) {
        this.serviceType = PlatformServices.Mall;
      }
    });
  }
}
