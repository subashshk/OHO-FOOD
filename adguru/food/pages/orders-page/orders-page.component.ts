import { Component, OnInit } from '@angular/core';
import { OrderStatus } from '../../enums/food.enum';
import { FoodService } from '../../services/food.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PlatformServices } from '@globalEnums/services.enum';
import { OHORouteData } from '@globalEnums/oho-route-data.enum';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.scss']
})
export class OrdersPageComponent implements OnInit {
  public breadcrumbs: {
    name: string;
    route: string;
  }[] = [
    { name: 'Orders', route: '' },
    { name: 'All Orders', route: '' }
  ];
  public showFilter: boolean = false;
  public searchStr: string;
  public isLoading: boolean = false;
  public ordersList: any[] = [];
  public perPage: number = 10;
  public pageIndex: number = 1;
  public totalCount: number;
  public orderStatus: typeof OrderStatus = OrderStatus;
  public orderStatusSelect: any = {
    placeholder: 'Payment Method: All',
    options: [
      { label: 'Delivered', value: OrderStatus.Delivered },
      { label: 'Pending', value: OrderStatus.Pending },
      { label: 'Cancelled', value: OrderStatus.Cancelled },
      { label: 'Received', value: OrderStatus.Received },
      { label: 'Confirm', value: OrderStatus.Confirm },
      { label: 'Shipping', value: OrderStatus.Shipping },
      { label: 'Ready', value: OrderStatus.Ready }
    ]
  }
  public statusStr: string;
  private serviceType: string = PlatformServices.Food;

  constructor(
    private service: FoodService,
    private notification: NzNotificationService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkRoute();
    this.getAllOrders()
  }

  public handlePerPageChanged = (newPerPage: number): void => {
    this.perPage = newPerPage;
    this.getAllOrders();
  }

  public handlePageChange = (pageNumber: number): void => {
    this.pageIndex = pageNumber;
    this.getAllOrders();
  }

  public toggleFilter = (filterFlag: boolean): void => {
    this.showFilter = filterFlag;
  }

  public searchTextStatus = (str: string): void => {
    this.searchStr = str;
    this.getAllOrders();
  }

  public handleFilter = (filter: string): void => {
    this.statusStr = filter;
    this.getAllOrders();
  }

  public resetFilter = (): void => {
    this.statusStr = null;
    this.getAllOrders();
  }

  public getAllOrders = (): void => {
    this.isLoading = true;
    this.service.getAllOrders(
      this.perPage,
      this.pageIndex,
      this.statusStr,
      this.searchStr,
      this.serviceType
    )
    .pipe(finalize(() => {this.isLoading = false}))
    .subscribe(res => {
      if (res?.success) {
        this.totalCount = res?.data?.totalCount;
        this.ordersList = res?.data?.orders;
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An error occured while fetching data'
      );
    });
  }

  public checkRoute = (): void => {
    this.activeRoute.data.subscribe(data => {
      let routeData = data?.routeData;
      if (routeData === OHORouteData.Mart) {
        this.serviceType = PlatformServices.Mart;
      }
      if (routeData === OHORouteData.Food) {
        this.serviceType = PlatformServices.Food
      }
      if (routeData === OHORouteData.Mall) {
        this.serviceType = PlatformServices.Mall;
      }
    });
  }
}
