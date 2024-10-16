import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { finalize } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { RangeType } from '@globalEnums/range-type.enum';
import { SalesType } from '../../enums/food.enum';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OHORouteData } from '@globalEnums/oho-route-data.enum';
import { PlatformServices } from '@globalEnums/services.enum';

export interface FoodDashboardItem {
  title: string;
  info: string;
  icon?: string;
}

@Component({
  selector: 'app-food-dashboard',
  templateUrl: './food-dashboard.component.html',
  styleUrls: ['./food-dashboard.component.scss']
})
export class FoodDashboardComponent implements OnInit {
  public isLoading: boolean = false;
  public breadcrumbs: {
    name: string;
    route: string;
  }[] = [
    { name: 'Dashboard', route: '' },
    { name: 'Food', route: '' }
  ];
  public foodDashboardItems: FoodDashboardItem[] = [];
  public topVendorsOptions: any;
  public topSellingOptions: any;
  public topSellingProducts: any;
  public vendorDateRange: Date[];
  public categoriesDateRange: Date[];
  public productsDateRange: Date[];
  private titleCasePipe: TitleCasePipe = new TitleCasePipe();
  private serviceType: PlatformServices = PlatformServices.Food;
  public title: string;
  private perPage: number = 4;
  private pageIndex: number = 1;

  constructor(
    private service: FoodService,
    private notification: NzNotificationService,
    private utility: UtilityService,
    private activeRoute: ActivatedRoute
  ) {
    this.topVendorsOptions = {
      isLoading: false,
      chartTitle: 'Top 4 Vendors by Sales',
      hasFilter: true,
      series: [24, 23, 35, 8],
      chart: {
        type: 'donut',
        height: 365,
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        itemMargin: {
          horizontal: 5,
          vertical: 5,
        },
      },
      plotOptions: {
        pie: {
          customScale: 1,
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
              },
              value: {
                show: true,
                fontSize: '12px',
                fontWeight: 600,
                formatter: function (val) {
                  return 'Rs.' + ' ' + val;
                },
              },
              total: {
                show: true,
                label: 'Total',
                fontWeight: 600,
                formatter: function (w) {
                  return (
                    'Rs.' +
                    ' ' +
                    w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0)
                  );
                },
              },
            },
            size: '45%',
          },
        },
      },
      labels: [],
      colors: ['#3F7DC9', '#ec3a3a', '#f5a623', '#7acc29'],
    };
    this.topSellingOptions = {
      isLoading: false,
      chartTitle: 'Top 4 Selling Categories',
      hasFilter: true,
      series: [10, 0, 13, 1],
      chart: {
        type: 'donut',
        height: 365,
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        itemMargin: {
          horizontal: 5,
          vertical: 5,
        },
      },
      plotOptions: {
        pie: {
          customScale: 1,
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
              },
              value: {
                show: true,
                fontSize: '12px',
                fontWeight: 600,
                formatter: function (val) {
                  return 'Rs.' + ' ' + val;
                },
              },
              total: {
                show: true,
                label: 'Total',
                fontWeight: 600,
                formatter: function (w) {
                  return (
                    'Rs.' +
                    ' ' +
                    w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0)
                  );
                },
              },
            },
            size: '45%',
          },
        },
      },
      labels: [],
      colors: ['#3F7DC9', '#ec3a3a', '#f5a623', '#7acc29'],
    };
    this.topSellingProducts = {
      isLoading: false,
      chartTitle: 'Top 4 Selling Products',
      hasFilter: true,
      series: [24, 23, 35, 8],
      chart: {
        type: 'donut',
        height: 365,
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        itemMargin: {
          horizontal: 5,
          vertical: 5,
        },
      },
      plotOptions: {
        pie: {
          customScale: 1,
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
              },
              value: {
                show: true,
                fontSize: '12px',
                fontWeight: 600,
                formatter: function (val) {
                  return 'Rs.' + ' ' + val;
                },
              },
              total: {
                show: true,
                label: 'Total',
                fontWeight: 600,
                formatter: function (w) {
                  return (
                    'Rs.' +
                    ' ' +
                    w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0)
                  );
                },
              },
            },
            size: '45%',
          },
        },
      },
      labels: [],
      colors: ['#3F7DC9', '#ec3a3a', '#f5a623', '#7acc29'],
    };
  }

  ngOnInit(): void {
    this.checkRouteData();
    this.getFoodDashboardNumbers();
    this.setDateRangeData();
    this.getTopVendorSales();
  }

  public setDateRangeData = (): void => {
    this.vendorDateRange = this.utility.getPresetRange(RangeType.ThisYear);
    this.categoriesDateRange = this.utility.getPresetRange(RangeType.ThisYear);
    this.productsDateRange = this.utility.getPresetRange(RangeType.ThisYear);
  }

  public getFoodDashboardNumbers = (): void => {
    this.isLoading = true
    this.service.getDashboardCounts(
      this.serviceType
    )
      .pipe(finalize(() => { this.isLoading = false }))
      .subscribe(res => {
        if (res?.success) {
          for (let key in res?.data) {
            if (Object.prototype.hasOwnProperty.call(res?.data, key)) {
              this.foodDashboardItems.push({
                title: this.titleCasePipe.transform(this.changeCase(key)),
                info: res?.data[key].toString()
              });
            }
          }
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'An error occured while fetching counts'
        );
      });
  }

  public getTopVendorSales = (dateRange?: Date[]): void => {
    this.topVendorsOptions.isLoading = true;
    if (dateRange) {
      this.vendorDateRange = dateRange;
    }
    this.topVendorsOptions.series = [];
    this.topVendorsOptions.labels = [];
    this.service.getTopSalesData(
      this.vendorDateRange,
      SalesType.Vendor,
      false,
      this.perPage,
      this.pageIndex,
      null,
      null,
      this.serviceType
    )
    .pipe(finalize(() => { this.topVendorsOptions.isLoading = false }))
    .subscribe(res => {
      if (res?.success) {
        let vendorSalesDataList = res?.data?.data;
        vendorSalesDataList.forEach(data => {
          this.topVendorsOptions.labels.push(data?.name);
          this.topVendorsOptions.series.push(Number(data?.totalSales))
        })
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An unexpected error occured while fetching top vendor sales'
      )
    })
  }

  public getTopCategoryData = (dateRange: Date[]): void => {
    this.topSellingOptions.isLoading = true;
    if (dateRange) {
      this.categoriesDateRange = dateRange;
    }
    this.topSellingOptions.series = [];
    this.topSellingOptions.labels = [];
    this.service.getTopSalesData(
      this.categoriesDateRange,
      SalesType.Categories,
      true,
      this.perPage,
      this.pageIndex,
      null,
      null,
      this.serviceType
    )
      .pipe(finalize(() => { this.topSellingOptions.isLoading = false}))
      .subscribe(res => {
        if (res?.success) {
          let topSellingDataList = res?.data?.data;
          topSellingDataList.forEach(data => {
            this.topSellingOptions.labels.push(data?.name);
            this.topSellingOptions.series.push(Number(data?.totalSales));
          });
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'An unexpected error occured while fetching top selling categories'
        )
      })
  }

  public getTopSellingProducts = (dateRange: Date[]): void => {
    this.topSellingProducts.isLoading = true;
    if (dateRange) {
      this.productsDateRange = dateRange;
    }
    this.topSellingProducts.label = [];
    this.topSellingProducts.series = [];
    this.service.getTopSalesData(
      this.productsDateRange,
      SalesType.Product,
      false,
      this.perPage,
      this.pageIndex,
      null,
      null,
      this.serviceType
    )
      .pipe(finalize(() => { this.topSellingProducts.isLoading = false }))
      .subscribe(res => {
        if (res?.success) {
          let topSellingProdDataList = res?.data?.data;
          topSellingProdDataList.forEach(element => {
            this.topSellingProducts.labels.push(element?.name);
            this.topSellingProducts.series.push(Number(element?.totalSales));
          });
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'An unexpected error occured while fetching top selling products'
        )
      })
  }

  public checkRouteData = (): void => {
    this.activeRoute.data.subscribe(data => {
      if (data.routeData === OHORouteData.Food) {
        this.serviceType = PlatformServices.Food;
        this.breadcrumbs[1] = {
          name: 'Food', route: ''
        }
        this.title = 'Food Dashboard'
      }
      if (data.routeData === OHORouteData.Mall) {
        this.serviceType = PlatformServices.Mall;
        this.breadcrumbs[1] = {
          name: 'Mall', route: ''
        }
        this.title = 'Mall Dashboard'
      }
      if (data.routeData === OHORouteData.Mart) {
        this.serviceType = PlatformServices.Mart;
        this.breadcrumbs[1] = {
          name: 'Mart', route: ''
        }
        this.title = 'Mart Dashboard'
      }
    });
  }

  public changeCase = (text: string): string => {
    return text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  }
}
