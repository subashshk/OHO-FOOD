import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { SalesType } from '../../enums/food.enum';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { RangeType } from '@globalEnums/range-type.enum';
import { ReportService } from 'src/app/modules/admin/services/report.service';
import { PlatformServices } from '@globalEnums/services.enum';
import { ActivatedRoute } from '@angular/router';
import { OHORouteData } from '@globalEnums/oho-route-data.enum';

@Component({
  selector: 'app-sales-by-product',
  templateUrl: './sales-by-product.component.html',
  styleUrls: ['./sales-by-product.component.scss']
})
export class SalesByProductComponent implements OnInit {
  public breadcrumbs: {
    name: string;
    route: string;
  }[] =[
    { name: 'Reports', route: '' },
    { name: 'Sales by Product', route: '' }
  ];
  public filterOptions: any = [
    {
      title: 'Vendor',
      option: {
        placeholder: 'Select vendor',
        options: []
      }
    },
  ];
  public categoryFilterSelect: any = [
    {
      title: 'Category',
      option: {
        placeholder: 'Select category',
        options: []
      }
    }
  ]
  public isLoading: boolean = false;
  public prodData: any[] = [];
  public rangeFilter: Date[];
  public perPage: number = 10;
  public pageIndex: number = 1;
  public totalCount: number;
  public export: boolean = false;
  public vendorId: string;
  public categoryId: string;
  public currentServiceType: PlatformServices;

  constructor(
    private service: FoodService,
    private notification: NzNotificationService,
    private utility: UtilityService,
    private reportService: ReportService,
    private modalService: NzModalService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkRoute();
    this.rangeFilter = this.utility.getPresetRange(RangeType.LastYear);
    this.getSalesByProduct();
    this.getCategories();
    this.getVendorList();
  }

  public getSalesByProduct = (): void => {
    this.isLoading = true;
    this.service.getTopSalesData(
      this.rangeFilter,
      SalesType.Product,
      false,
      this.perPage,
      this.pageIndex,
      this.vendorId,
      this.categoryId,
      this.currentServiceType
    )
    .pipe(finalize(() => { this.isLoading = false }))
    .subscribe(res => {
      if (res?.success) {
        this.totalCount = res?.data?.totalCount;
        this.prodData = res?.data?.data;
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'Error occured while fetching sales data'
      )
    })
  }

  public handlePageChange = (pageNumber: number): void => {
    this.pageIndex = pageNumber;
    this.getSalesByProduct();
  }

  public handlePerPageChange = (newPerPage: number): void => {
    this.perPage = newPerPage;
    this.getSalesByProduct();
  }

  public getCategories = (): void => {
    this.reportService.getCategoriesForDropdown(
      this.pageIndex,
      this.perPage,
      this.currentServiceType,
      'categories'
    )
    .subscribe(res => {
      if (res?.success) {
        res?.data?.data.forEach(element => {
          this.categoryFilterSelect[0].option.options.push(
            {
              label: element?.name,
              value: element?.id
            }
          )
        })
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An error occured while fetching categories list'
      );
    });
  }

  public getVendorList = (): void => {
    this.reportService.getStoresForDropdown(
      this.pageIndex,
      this.perPage,
      this.currentServiceType
    )
    .subscribe(res => {
      if (res?.success) {
        res?.data?.data.forEach(element => {
          this.filterOptions[0].option.options.push(
            {
              label: element?.name,
              value: element?.id
            }
          );
        });
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An error occured while fetching vendor list'
      )
    });
  }

  public handleExport = (exportFlag: boolean): void => {
    this.export = exportFlag;
    if (this.rangeFilter.length > 0 && this.export) {
      let startDate = this.utility.getUTCStartDateString(this.rangeFilter[0]);
      let endDate = this.utility.getUTCEndDateString(this.rangeFilter[1]);
      this.reportService.exportSalesData(
        'time',
        startDate,
        endDate
      ).subscribe(res => {
        if (res?.success) {
          this.modalService.info({
            nzTitle: 'Email Sent',
            nzContent: 'You will receive an email with the attachment shortly.',
            nzOkText: 'Ok',
            nzOkType: 'danger',
            nzWidth: '42%',
          });
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'An error occured while exporting data'
        );
      });
    }
    this.export = false;
  }

  public getRangeFilter = (range: Date[]): void => {
    this.rangeFilter = range;
    this.getSalesByProduct();
  }

  public storeFilter = (storeId: string): void => {
    this.vendorId = storeId;
    this.getSalesByProduct();
  }

  public categoryFilter = (categoryFilter: string): void => {
    this.categoryId = categoryFilter;
    this.getSalesByProduct();
  }

  public checkRoute = (): void => {
    this.activeRoute.data.subscribe(data => {
      if (data.routeData === OHORouteData.Food) {
        this.currentServiceType = PlatformServices.Food;
      }
      if (data.routeData === OHORouteData.Mart) {
        this.currentServiceType = PlatformServices.Mart;
      }
      if (data.routeData === OHORouteData.Mall) {
        this.currentServiceType = PlatformServices.Mall;
      }
    })
  }
}
