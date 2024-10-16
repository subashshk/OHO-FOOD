import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { OrderStatus } from 'src/app/shared/enums/order-status.enum';
import { Shipment } from 'src/app/models/shipment.model';
import { OrderService } from 'src/app/services/order.service';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { StoreService } from 'src/app/services/store.service';
import { Address } from 'src/app/models/address.model';
import { RangeType } from '../../enums/range-type.enum';
import { UtilityService } from 'src/app/services/utility.service';
import { DateRangeComponent } from '../date-range/date-range.component';
import * as moment from 'moment';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomerReturnsService } from 'src/app/services/customer-returns.service';
import { SortStatus } from '../../enums/sort-status';
import { ToastService } from 'src/app/services/toast.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent extends subscribedContainerMixin() implements OnInit, OnChanges {
  @Input() type: string;
  @Input() storeId: string;

  public orderList: any[] = [];

  userId: string;

  perPage = 5;
  currentPage = 1;
  totalCount: number;

  isLoading: boolean;
  storeAddressList: Address[] = [];
  storeAddressId = '';
  storeAddressName = '';
  rangeTypeName = '';
  customDate = '';
  public pageIndex: number = 1;
  public searchText: string;
  public sortStatus: { type: string; order: SortStatus } = {
    type: '',
    order: SortStatus.None,
  };
  public sortDeal: {
    name: SortStatus;
    email: SortStatus;
    created_at: SortStatus;
  } = {
    name: SortStatus.None,
    email: SortStatus.None,
    created_at: SortStatus.None,
  };

  dateRange: Date[] = [];
  isInitial: boolean;

  constructor(
    private orderService: OrderService,
    private navCtrl: NavController,
    private globalEmitter: GlobalEmitterService,
    private actionSheetController: ActionSheetController,
    private storeService: StoreService,
    private utility: UtilityService,
    private modalController: ModalController,
    private returnService: CustomerReturnsService,
    private toastService: ToastService
  ) {
    super();
    this.userId = JSON.parse(localStorage.getItem('currentUser')).id;
  }

  ngOnInit() {
    this.isLoading = true;
    this.isInitial = true;
    this.getReturnRequestList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.storeId) {
      this.getStoreAddress();
    }
    this.currentPage = 1;
    this.initialize();
  }

  doRefresh(event): void {
    this.initialize(event);
  }

  initialize(event = null): void {
    this.orderList = [];
    this.isLoading = true;
    this.getOrders();

    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 2000);
    }
  }

  getStoreAddress(): void {
    if (this.storeId) {
      this.storeAddressId = '';
      this.storeService
        .getStoreAddresses(this.storeId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          this.storeAddressList = plainToClass(Address, res.data.data);
        });
    }
  }

  getOrders(event = null, clearOrder = false): void {
    if (this.storeId) {
      let startDate = '';
      let endDate = '';
      if (this.dateRange.length > 0) {
        startDate = this.utility.getUTCStartDateString(this.dateRange[0]);
        endDate = this.utility.getUTCEndDateString(this.dateRange[1]);
      }
      if (clearOrder) {
        this.isLoading = true;
        this.currentPage = 1;
      }
      if(this.type === OrderStatus.Returns) {
        this.getReturnRequestList();
      } else {
        this.orderService
          .getOrders(
            this.userId,
            this.storeId,
            this.perPage,
            this.currentPage,
            this.type,
            this.storeAddressId,
            startDate,
            endDate
          )
          .pipe(
            takeUntil(this.destroyed$),
            finalize(() => this.isLoading = false )
          )
          .subscribe(
            (res) => {
              if (res?.success) {
                if (clearOrder) {
                  this.orderList = [];
                }
                this.totalCount = res?.data?.totalCount;
                res.data.orders.forEach((item: Shipment) => {
                  this.orderList.push(plainToClass(Shipment, item));
                });
                if (this.isInitial && res?.data?.orders?.length) {
                  this.isInitial = false;
                }
              }
              if (event) {
                event.target.complete();
                if (this.orderList?.length === this.totalCount) {
                  event.target.disabled = true;
                }
              }
            },
            (err) => {
              this.toastService.presentToast(err.error.message, 2000);
            }
          );
      }
    } else {
      this.isLoading = false;
    }
  }

  getMoreStores(event: any): void {
    this.currentPage += 1;
    this.getOrders(event);
  }

  public navigateToDetail(orderId: string): void {
    if(this.type !== OrderStatus.Returns) {
      this.navCtrl.navigateForward('order-detail/' + orderId);
    } else {
      this.navCtrl.navigateForward('return-details', {
        queryParams: {
          customerReturn: true,
          id: orderId
        }
      })
    }
}

  public getReturnRequestList(): void {
    this.isLoading = true;
    this.returnService
      .getReturnRequestList(
        this.pageIndex,
        this.perPage,
        this.searchText,
        this.sortStatus
      )
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        (res) => {
          this.orderList = plainToClass(Product, res?.data?.data);
          this.resetSortDeal();
          this.sortDeal[this.sortStatus.type] = this.sortStatus.order;
        },
        (err) => {
          this.toastService.presentToast(err?.error?.message, 2000);
        }
      );
  }

  public resetSortDeal(): void {
    Object.keys(this.sortDeal).forEach((key) => {
      this.sortDeal[key] = SortStatus.None;
    });
  }

  async presentLocationActionSheet(): Promise<void> {
    const buttonsArray = [];
    this.storeAddressList.forEach((element) => {
      buttonsArray.push({
        text: element.formattedAddress,
        role: 'destructive',
        cssClass:
          this.storeAddressId === element.id.toString() ? 'selected-action-sheet-button' : '',
        handler: () => {
          this.filterByLocation(element.id.toString(), element.formattedAddress);
        },
      });
    });
    buttonsArray.unshift({
      text: 'All',
      role: 'destructive',
      cssClass: !this.storeAddressId ? 'selected-action-sheet-button' : '',
      handler: () => {
        this.filterByLocation();
      },
    });
    const actionSheet = await this.actionSheetController.create({
      header: 'Filter By Location',
      cssClass: 'location-action-sheet',
      buttons: buttonsArray,
    });
    await actionSheet.present();
  }

  async presentDateActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filter By Date',
      cssClass: 'date-action-sheet',
      buttons: [
        {
          text: 'Today',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'Today' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.filterByDate(RangeType.Today, 'Today');
          },
        },
        {
          text: 'Last 7 Days',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'Last 7 Days' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.filterByDate(RangeType.Last7Days, 'Last 7 Days');
          },
        },
        {
          text: 'This Month',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'This Month' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.filterByDate(RangeType.ThisMonth, 'This Month');
          },
        },
        {
          text: 'Last Month',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'Last Month' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.filterByDate(RangeType.LastMonth, 'Last Month');
          },
        },
        {
          text: 'Last 6 Months',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'Last 6 Months' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.filterByDate(RangeType.Last6Months, 'Last 6 Months');
          },
        },
        {
          text: 'This Year',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'This Year' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.filterByDate(RangeType.ThisYear, 'This Year');
          },
        },
        {
          text: 'Custom Date',
          role: 'destructive',
          cssClass: this.rangeTypeName === 'Custom Date' ? 'selected-action-sheet-button' : '',
          handler: () => {
            this.rangeTypeName = 'Custom Date';
            this.showDatePicker();
          },
        },
      ],
    });
    await actionSheet.present();
  }

  filterByDate(type: RangeType, typeName: string): void {
    if (type) {
      this.rangeTypeName = typeName;
      this.dateRange = this.utility.getPresetRange(type);
      this.getOrders(null, true);
    }
  }

  filterByLocation(addressId?: string, addressName?: string): void {
    if (addressId) {
      this.storeAddressId = addressId;
      this.storeAddressName = addressName;
    } else {
      this.storeAddressId = '';
      this.storeAddressName = '';
    }
    this.getOrders(null, true);
  }

  clearFilter(): void {
    this.storeAddressId = '';
    this.storeAddressName = '';
    this.rangeTypeName = '';
    this.customDate = '';
    this.dateRange.length = 0;
    this.getOrders(null, true);
  }

  async showDatePicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: DateRangeComponent,
      cssClass: 'daterange-modal',
      backdropDismiss: false,
      componentProps: {
        stDate: this.dateRange[0] ? this.dateRange[0].toString() : '',
        endDate: this.dateRange[1] ? this.dateRange[1].toString() : '',
      },
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.dateRange[0] = new Date(dataReturned.data.stDate);
        this.dateRange[1] = new Date(dataReturned.data.endDate);
        this.customDate =
          moment(this.dateRange[0]).format('MMM DD, YYYY') +
          ' - ' +
          moment(this.dateRange[1]).format('MMM DD, YYYY');
        this.getOrders(null, true);
      }
    });

    return await modal.present();
  }

  get orderStatus(): any {
    return OrderStatus;
  }
}
