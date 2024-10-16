import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutePath } from '../../enums/food.enum';
import { ReportService } from 'src/app/modules/admin/services/report.service';
import { FoodService } from '../../services/food.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { NzModalService } from 'ng-zorro-antd';
import { NzNotificationService } from 'ng-zorro-antd';
import { SalesType } from '../../enums/food.enum';
import { finalize } from 'rxjs/operators';
import { PlatformServices } from '@globalEnums/services.enum';
import { RangeType } from '@globalEnums/range-type.enum';
@Component({
  selector: 'app-sales-by-category',
  templateUrl: './sales-by-category.component.html',
  styleUrls: ['./sales-by-category.component.scss']
})
export class SalesByCategoryComponent implements OnInit {
  public isLoading: boolean = false;
  public pageIndex: number = 1;
  public perPage: number = 10;
  public totalPageCount: number = 10;
  public title: string;
  public breadcrumbs: {
    name: string;
    route: string;
  }[] =[
    { name: 'Reports', route: '' },
    { name: 'Sales by Product', route: '' }
  ];
  public filterOpt: any;
  public filterOptions: any = [
    {
      title: 'Vendor',
      option: {
        placeholder: 'Select vendor',
        options: []
      }
    },
    {
      title: 'Category',
      option: {
        placeholder: 'Select category',
        options: []
      }
    }
  ];
  public serviceType: string;
  public dataList: any[] = [];
  public path: string;
  public route: typeof RoutePath = RoutePath;
  public rangeFilter: Date[];
  public taxonCategory: boolean = false;
  public export: boolean;
  public selectedVendor: string;
  public selectedCategory: string;
  public currentServiceType: PlatformServices;

  constructor(
    private activeRoute: ActivatedRoute,
    private utility: UtilityService,
    private service: FoodService,
    private reportService: ReportService,
    private modalService: NzModalService,
    private notification: NzNotificationService
  ) {
  }
  
  ngOnInit(): void {
    this.checkRoute();
    this.rangeFilter = this.utility.getPresetRange(RangeType.Last6Months);
    this.getSalesData();
    this.getVendorList();
    this.getCategoriesList();
  }

  public handlePageChange = (pageNumber: number): void => {
    this.pageIndex = pageNumber;
    this.getSalesData();
  }

  public handlePerPageChange = (perPageNew: number): void => {
    this.perPage = perPageNew;
    this.getSalesData();
  }

  public getSalesData = (): void => {
    this.isLoading = true;
    this.service.getTopSalesData(
      this.rangeFilter,
      this.serviceType,
      this.taxonCategory,
      this.perPage,
      this.pageIndex,
      this.selectedVendor,
      this.selectedCategory,
      this.currentServiceType
    )
    .pipe(finalize(() => { this.isLoading = false }))
    .subscribe(res => {
      if (res?.success) {
        this.totalPageCount = res?.data?.totalCount;
        this.dataList = res?.data?.data;
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An unexpected error occured while fetching data'
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
          )
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

  public getCategoriesList = (): void => {
    this.reportService.getCategoriesForDropdown(
      this.pageIndex,
      this.perPage,
      this.currentServiceType,
      'categories'
    )
    .subscribe(res => {
      if (res?.success) {
        res?.data?.data.forEach(element => {
          this.filterOptions[1].option.options.push(
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

  public exportData = (exportFlag: boolean): void => {
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

  public handleRangeFilter = (range: Date[]): void => {
    this.rangeFilter = range;
    this.getSalesData();
  }

  public vendorFilter = (vendorSelected: string): void => {
    this.selectedVendor = vendorSelected;
    this.getSalesData();
  }

  public categoryFilter = (categorySelected: string): void => {
    this.selectedCategory = categorySelected;
    this.getSalesData();
  }

  public checkRoute = (): void => {
    this.activeRoute.data.subscribe(res => {
      switch (res.routeData.serviceType) {
        case PlatformServices.Food:
          this.currentServiceType = PlatformServices.Food;
          break;
        case PlatformServices.Mart:
          this.currentServiceType = PlatformServices.Mart;
          break;
        case PlatformServices.Mall:
          this.currentServiceType = PlatformServices.Mall;
          break;
      }
      if (res.routeData.path === RoutePath.Category) {
        this.path = RoutePath.Category;
        this.title = 'Sales By Categories';
        this.filterOpt = [this.filterOptions[1]];
        this.serviceType = SalesType.Categories;
        this.taxonCategory = true;
        this.getCategoriesList();
      } else {
        this.path = RoutePath.Vendor;
        this.title = 'Sales By Vendor';
        this.filterOpt = [this.filterOptions[0]];
        this.serviceType = SalesType.Vendor;
        this.taxonCategory = false;
        this.getVendorList();
      }
    });
  }

  public handleFilterString = (filterStr: string): void => {
    if (this.path === RoutePath.Category) {
      this.categoryFilter(filterStr);
    }
    if (this.path === RoutePath.Vendor) {
      this.vendorFilter(filterStr);
    }
  }
}
