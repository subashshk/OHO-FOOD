import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { RangeType } from '@globalEnums/range-type.enum';
import { FoodService } from '../../services/food.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { ReportService } from 'src/app/modules/admin/services/report.service';
import { NzModalService } from 'ng-zorro-antd';
import { SortStatus } from '@globalEnums/sort-status.enum';
import { PlatformServices } from '@globalEnums/services.enum';
import { ActivatedRoute } from '@angular/router';
import { OHORouteData } from '@globalEnums/oho-route-data.enum';

@Component({
  selector: 'app-food-sales-over-time',
  templateUrl: './food-sales-over-time.component.html',
  styleUrls: ['./food-sales-over-time.component.scss']
})
export class FoodSalesOverTimeComponent implements OnInit {
  public breadcrumbs: {
    name: string;
    route: string;
  }[] = [
    { name: 'Reports', route: '' },
    { name: 'Sales Over Time', route: '' }
  ];
  public statusFilter: string;
  public isLoading: boolean = false;
  public orderStatusSelect: any = [{
    title: 'Store',
    option: {
      placeholder: 'Status Filter: All',
      options: [
        { label: 'New', value: null },
        { label: 'Blocked', value: null },
        { label: 'Active', value: null }
      ]
    }
  }];
  public salesDateRange: Date[];
  public exportData: boolean;
  public salesOverTimeChartOptions: any;
  public salesData: any[] = [];
  public sortReportData: {
    orders_count: SortStatus;
    gross_sales: SortStatus;
    discount: SortStatus;
    net_sales: SortStatus;
    delivery: SortStatus;
    total_sales: SortStatus;
  } = {
    orders_count: SortStatus.None,
    gross_sales: SortStatus.None,
    discount: SortStatus.None,
    net_sales: SortStatus.None,
    delivery: SortStatus.None,
    total_sales: SortStatus.None,
  }
  public sortStatus: {
    type: string;
    order: SortStatus
  } = {
    type: '',
    order: SortStatus.None,
  };
  public currentServiceType: PlatformServices;

  constructor(
    private service: FoodService,
    private notificaiton: NzNotificationService,
    private utility: UtilityService,
    private modalService: NzModalService,
    private reportService: ReportService,
    private activeRoute: ActivatedRoute
  ) {
    this.salesOverTimeChartOptions = {
      isLoading: false,
      chartTitle: 'Total Sales',
      series: [
        {
          data: [10, 41, 35, 51, 49, 62, 69, 91]
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      yaxis: {
        title: {
          text: 'Amount (In Rs)',
          offsetX: 5,
        },
        labels: {
          offsetX: 15,
        },
      },

      xaxis: {
        categories: ['May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
    };
  }

  ngOnInit(): void {
    this.checkRoute();
    this.salesDateRange = this.utility.getPresetRange(RangeType.LastYear);
    this.getTotalSalesData();
  }

  public getTotalSalesData = (dateRange?: Date[]): void => {
    this.salesOverTimeChartOptions.isLoading = true;
    this.isLoading = true;
    if (dateRange) {
      this.salesDateRange = dateRange;
    }
    this.salesOverTimeChartOptions.series = [
      {
        data: []
      }
    ];
    this.salesOverTimeChartOptions.xaxis = {
      categories: []
    }
    this.service.getSalesOverviewData(
      this.salesDateRange,
      this.statusFilter,
      10,
      this.currentServiceType,
      this.sortStatus,
    )
    .pipe(finalize(() => {
      this.salesOverTimeChartOptions.isLoading = false;
      this.isLoading = false;
    }))
    .subscribe(res => {
      if (res?.success) {
        let totalSalesData = {};
        this.salesData = [res?.data?.data];
        if (!(Object.keys(res?.data?.data).length === 0 && res?.data?.data.constructor === Object)) {
          totalSalesData = this.utility.mapData(
            res?.data?.data,
            this.utility.getUTCStartDateString(
              this.salesDateRange[0]
            ),
            this.utility.getUTCEndDateString(
              this.salesDateRange[1]
            )
          );
        }
        for (let category in totalSalesData) {
          if (totalSalesData?.hasOwnProperty(category)) {
            this.salesOverTimeChartOptions.xaxis.categories.push(category);
            this.salesOverTimeChartOptions.series[0].data.push(
              totalSalesData[category]?.totalSales ?? 0
            )
          }
        }
      }
    }, err => {
      this.notificaiton.create(
        'error',
        'Error',
        'An error occured while fetching graph data'
      )
    });
  }

  public exportSalesData = (): void => {
    if (this.salesData.length > 0) {
      const startDate = this.utility.getUTCStartDateString(this.salesDateRange[0]);
      const endDate = this.utility.getUTCEndDateString(this.salesDateRange[1]);
      this.reportService
        .exportSalesData('time', startDate, endDate)
        .subscribe((res) => {
          if (res?.success) {
            this.modalService.info({
              nzTitle: 'Email Sent',
              nzContent: 'You will receive an email with the attachment shortly.',
              nzOkText: 'Ok',
              nzOkType: 'danger',
              nzWidth: '42%',
            });
          }
        });
    }
  }

  public setSalesDateRange = (dateRange: Date[]): void => {
    this.salesDateRange = dateRange;
    this.getTotalSalesData();
  }

  public handleStatus = (statusStr: string): void => {
    this.statusFilter = statusStr;
    this.getTotalSalesData();
  }

  public exportDataEvent = (event: boolean): void => {
    if (event) {
      this.exportSalesData();
    }
  }

  public sortTable = (type: string): void => {
    if (this.sortStatus.type !== type) {
      this.sortStatus.order = SortStatus.None;
    }
    this.sortStatus.type = type;
    this.toogleSortReportData();
    this.getTotalSalesData();
  }

  private toogleSortReportData = (): void => {
    switch (this.sortStatus.order) {
      case SortStatus.None:
        this.sortStatus.order = SortStatus.Ascending;
        break;
      case SortStatus.Ascending:
        this.sortStatus.order = SortStatus.Descending;
        break;
      case SortStatus.Descending:
        this.sortStatus.order = SortStatus.Ascending;
        break;
      default:
        this.sortStatus.order = SortStatus.None;
    }
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
