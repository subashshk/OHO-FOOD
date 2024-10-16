import { PlatformService } from './../../services/platform.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FilterType } from './../../enums/filter-type.enum';
import { plainToClass } from 'class-transformer';
import { SortStatus } from './../../enums/sort-status.enum';
import { OrderStatus } from '@globalEnums/order-status.enum';
import { ProductService } from 'src/app/services/product.service';
import { OrderItem } from './../../models/order-item.model';
import { PlatformServices } from './../../enums/services.enum';
import {
  NavController,
  ActionSheetController,
  ModalController,
} from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';
import { takeUntil } from 'rxjs/operators';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ReturnProductService } from 'src/app/services/return-product.service';
import { ReturnDetailsComponent } from 'src/app/shared/components/return-details/return-details.component';
import { OrderStatusMall, OrderStatusParent } from '@globalEnums/order-status-parent.enum';
import { OrderStore } from 'src/app/models/order-store.model';
import { JobsStatus, JobsStatusForApi } from '@globalEnums/jobs-status.enum';
import { SegmentList } from 'src/app/models/segment-list.model';

enum SortParams {
  ProductName = 'product_name',
  StoreName = 'store_name',
  DateTime = 'updated_at',
  Status = 'state',
}
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage extends subscribedContainerMixin() implements OnInit {
  currentServiceType: PlatformServices;
  isLoading = true;
  orderItems: OrderItem[];
  public orders: OrderStore[];
  ordersCount = 0;
  public returnCount: number = 0;
  public returnLoader: boolean = false;
  currentPage = 1;
  perPage = 10;
  public orderStatusType: any = OrderStatusParent;
  public orderStatus: any = OrderStatusParent.All;
  public filter: FilterType = FilterType.All_Orders;
  public sortStatus: { columnName: string; order: SortStatus } = {
    columnName: '',
    order: SortStatus.None,
  };
  searchBarIsExpanded = false;
  searchText = '';
  public listOfReturn;
  public orderSegment: any[];

  public segmentList: any[] = [
    { label: 'All', value: OrderStatusParent.All },
    { label: 'Upcoming', value: OrderStatusParent.Upcoming },
    { label: 'Ongoing', value: OrderStatusParent.Ongoing },
    { label: 'Completed', value: OrderStatusParent.Completed },
    { label: 'Cancelled', value: OrderStatusParent.Cancelled },
  ];

  public segmentListMall: any[] = [
    { label: 'All', value: OrderStatusMall.All },
    { label: 'Placed', value: OrderStatusMall.Placed },
    { label: 'Processing', value: OrderStatusMall.Processing },
    { label: 'Dispatched', value: OrderStatusMall.Dispatched },
    { label: 'Delivered', value: OrderStatusMall.Delivered },
    { label: 'Returns', value: OrderStatusMall.Returns },
  ];

  public jobSegmentList: SegmentList[] = [
    { label: 'All', value: JobsStatusForApi.All },
    { label: 'Applied', value: JobsStatusForApi.Applied },
    { label: 'Pending', value: JobsStatusForApi.Pending },
    { label: 'Accepted', value: JobsStatusForApi.Accepted },
    { label: 'Rejected', value: JobsStatusForApi.Rejected }
  ];
  public fromAccounts: boolean = false;
  private myJobsRoutePath: string = '/tabs/orders';
  title = '';

  constructor(
    private navCtrl: NavController,
    private productService: ProductService,
    private route: ActivatedRoute,
    private platformService: PlatformService,
    private actionSheetController: ActionSheetController,
    private returnProductService: ReturnProductService,
    private modalCtrl: ModalController,
    public router: Router,
  ) {
    super();

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        if (ev.urlAfterRedirects === this.myJobsRoutePath) {
          this.fromAccounts = false;
        } else {
          this.fromAccounts = true;
        }
      }
    });
  }

  get platformServices() {
    return PlatformServices;
  }

  ionViewWillEnter() {
    this.initialize();
    this.searchBarIsExpanded = false;

    // scroll the selected segment in view in initial case
    document.querySelector('.segment-button-checked').scrollIntoView({
      behavior: 'smooth',
    });
  }

  public ngOnInit(): void {
    this.currentServiceType = this.platformService.getCurrentServiceType();
    if (this.currentServiceType === this.platformServices.Mall) {
      this.orderSegment = this.segmentListMall;
      this.orderStatus = this.route.snapshot.paramMap.get(
        'status'
      ) as OrderStatusParent;
    } else if (this.currentServiceType === this.platformServices.Job) {
      this.title = "Application";
      this.orderSegment = this.jobSegmentList;
      this.orderStatus = this.route.snapshot.paramMap.get(
        'status'
      ) as JobsStatus ?? JobsStatusForApi.All;
    } else {
      this.orderSegment = this.segmentList;
      this.orderStatus = this.route.snapshot.paramMap.get(
        'status'
      ) as OrderStatusMall;
    }
  }

  searchBarExpanded(expanded: boolean) {
    this.searchBarIsExpanded = expanded;
  }

  public initialize(event = null, changeEvent = this.orderStatus): void {
    this.isLoading = true;
    this.returnLoader = true;
    this.orderStatus = changeEvent;
    this.currentPage = 1;
    this.populateOrders(false, event);
    this.getReturnedList();
  }

  doRefresh(event) {
    this.initialize(event);
  }

  searchOrder(searchText: string) {
    this.searchText = searchText;
    this.isLoading = true;
    this.populateOrders();
  }

  public populateOrders(addToPrevious = false, event = null) {
    if (this.currentServiceType === PlatformServices.Mall || this.currentServiceType === PlatformServices.Job) {
      this.productService
        .getOrderItems(
          this.currentPage,
          this.perPage,
          this.currentServiceType,
          this.orderStatus,
          this.searchText,
          this.sortStatus,
          this.filter
        )
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res) {
            if (!addToPrevious) {
              this.orderItems = [];
            }
            res.data.data.forEach((item: OrderItem) => {
              this.orderItems.push(plainToClass(OrderItem, item));
            });
            this.ordersCount = res.data.totalCount;
            if (event) {
              event.target.complete();
              if (this.orderItems.length === this.ordersCount) {
                event.target.disabled = true;
              }
            }
          }
          this.isLoading = false;
        });
    } else {
      this.productService
        .getOrders(
          this.currentPage,
          this.perPage,
          this.currentServiceType,
          this.orderStatus,
          this.searchText,
          this.sortStatus,
          this.filter
        )
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res) {
            if (!addToPrevious) {
              this.orders = [];
            }
            res?.data?.orders.forEach((item: OrderStore) => {
              this.orders.push(plainToClass(OrderStore, item));
            });
            this.ordersCount = res.data.totalCount;
            if (event) {
              event.target.complete();
              if (this.orders.length === this.ordersCount) {
                event.target.disabled = true;
              }
            }
          }
          this.isLoading = false;
        });
    }
  }

  populateMoreOrders(event: any) {
    this.currentPage += 1;
    this.populateOrders(true, event);
  }

  public populateMoreReturnOrders(event: any): void {
    this.currentPage += 1;
    this.getReturnedList(true, event);
  }

  navigateTo(url: string) {
    this.navCtrl.navigateForward(url);
  }

  async showSortSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sort',
      cssClass: 'sort-sheet',
      buttons: [
        {
          text: 'Product name (Low to High)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.ProductName,
            SortStatus.Ascending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.ProductName, SortStatus.Ascending);
          },
        },
        {
          text: 'Product name (High to Low)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.ProductName,
            SortStatus.Descending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.ProductName, SortStatus.Descending);
          },
        },
        {
          text: 'Store name (Low to High)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.StoreName,
            SortStatus.Ascending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.StoreName, SortStatus.Ascending);
          },
        },
        {
          text: 'Store name (High to Low)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.StoreName,
            SortStatus.Descending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.StoreName, SortStatus.Descending);
          },
        },
        {
          text: 'Date/Time (Low to High)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.DateTime,
            SortStatus.Ascending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.DateTime, SortStatus.Ascending);
          },
        },
        {
          text: 'Date/Time (High to Low)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.DateTime,
            SortStatus.Descending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.DateTime, SortStatus.Descending);
          },
        },
        {
          text: 'Status (Low to High)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.Status,
            SortStatus.Ascending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.Status, SortStatus.Ascending);
          },
        },
        {
          text: 'Status (High to Low)',
          role: 'destructive',
          cssClass: this.isMatchingSortStatus(
            SortParams.Status,
            SortStatus.Descending
          )
            ? 'selected-action-sheet-button'
            : '',
          handler: () => {
            this.sortOrders(SortParams.Status, SortStatus.Descending);
          },
        },
      ],
    });
    await actionSheet.present();
  }

  isMatchingSortStatus(sortBy: SortParams, sortOrder: SortStatus): boolean {
    if (
      this.sortStatus.columnName === sortBy &&
      this.sortStatus.order === sortOrder
    ) {
      return true;
    }
    return false;
  }

  sortOrders(sortBy: SortParams, sortOrder: SortStatus) {
    this.isLoading = true;
    this.currentPage = 1;
    this.sortStatus.columnName = sortBy;
    this.sortStatus.order = sortOrder;
    this.populateOrders();
  }

  public getReturnedList(addToPrevious = false, event = null): void {
    this.returnProductService
      .getReturnedProductList(
        this.currentPage,
        this.perPage
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res) {
          if (!addToPrevious) {
            this.listOfReturn = [];
          }
          res.data.data.forEach((item: OrderItem) => {
            this.listOfReturn.push(plainToClass(OrderItem, item));
          });
          this.returnCount = res?.data?.totalCount;
          if (event) {
            event.target.complete();
            if (this.orderItems.length === this.returnCount) {
              event.target.disabled = true;
            }
          }
        }
        this.returnLoader = false;
      });
  }

  public getReturnedItemDetail(userID): void {
    this.returnProductService
      .getReturnedItemDetail(userID)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res) {
          this.showCreateReturnModal(res);
        }
      });
  }
  public showCreateReturnModal = async (res): Promise<void> => {
    const modal = await this.modalCtrl.create({
      component: ReturnDetailsComponent,
      componentProps: {
        payload: res,
      },
    });
    return await modal.present();
  };

  public goBack(): void {
    this.navCtrl.back();
  }
}
