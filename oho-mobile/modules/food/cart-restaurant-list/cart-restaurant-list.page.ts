import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformServices } from '@globalEnums/services.enum';
import { ModalController, NavController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { PlatformService } from 'src/app/services/platform.service';
import { ProductOrderService } from 'src/app/services/product-order.service';
import { ToastService } from 'src/app/services/toast.service';
import { CustomAlertComponent } from 'src/app/shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-cart-restaurant-list',
  templateUrl: './cart-restaurant-list.page.html',
  styleUrls: ['./cart-restaurant-list.page.scss'],
})
export class CartRestaurantListPage implements OnInit {
  public currentServiceType: PlatformServices;
  public orders: any;
  public isLoading: boolean = false;
  public selectedOrder: any;
  public showDeleteButton: boolean = false;
  public selectedOrderIds: any[] = [];

  constructor(
    private navCtrl: NavController,
    private orderService: ProductOrderService,
    private platformService: PlatformService,
    private router: Router,
    private modalController: ModalController,
    private toastService: ToastService,
    private globalEmitterService: GlobalEmitterService
  ) { }

  ngOnInit(): void {
    this.currentServiceType = this.platformService.getCurrentServiceType();
    this.getOrderList();
  }

  public doRefresh(event: any): void {
    this.getOrderList();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  ionViewWillEnter(): void {
    this.getOrderList();
  }

  public back(): void {
    this.navCtrl.back();
  }

  public toggleProductSelection(order: any): void {
    order.selected = !order.selected
    this.showDeleteButton = this.orders.some(order => order.selected);
    if (order.selected) {
      this.selectedOrderIds.push(order?.number);
    } else {
      const index = this.selectedOrderIds.indexOf(order?.number);
      if (index !== -1) {
        this.selectedOrderIds.splice(index, 1);
      }
    }
  }

  public async deleteSelectedOrders(order: any = null): Promise<void> {
    let msg;
    if(order) {
      msg = 'Are you sure you want to remove this restaurant from your cart?'
    } else {
      msg = 'Are you sure you want to remove the selected restaurants from your cart?'
    }
    const modal = await this.modalController.create({
      cssClass: 'alert-modal',
      component: CustomAlertComponent,
      animated: false,
      componentProps: {
        title: 'Confirm Delete',
        text: msg
      }
    })

    modal.onDidDismiss().then(res => {
      if (res?.data?.status === 'confirm') {
        this.deleteConfirm(order);
      }
    })

    return await modal.present();
  }

  public deleteConfirm(order: any = null): void {
    if (order) {
      this.deleteOrder(order);
    } else {
      this.selectedOrderIds.forEach(orderNumber => {
        this.orderService.deleteOrder(orderNumber)
          .subscribe((res) => {
            if(res?.success) {
              this.showDeleteButton = false;
              this.getOrderList();
              this.globalEmitterService.getOrderCount.emit(true);
            }
          })
      },
        (err) => {
          this.toastService.presentToast('Failed to delete the orders');
        })
    }
  }

  public deleteOrder(order: any): void {
    this.orderService.deleteOrder(order?.number)
      .subscribe((res) => {
        if (res?.success) {
          this.getOrderList();
          this.globalEmitterService.getOrderCount.emit(true);
        }
      },
        (err) => {
          this.toastService.presentToast('Failed to delete the order');
        })
  }

  public getOrderList(): void {
    this.isLoading = true;
    this.orderService.getFoodOrderList(this.currentServiceType)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe((res) => {
        this.orders = res?.data?.orders
        this.selectedOrder = this.orders;
      },
        (err) => {
          // handle error
        })
  }

  public navigateToCartPage(storeId: number): void {
    this.router.navigate(['cart'], { state: { storeId: storeId } });
  }
}
