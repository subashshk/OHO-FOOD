import { Component, OnInit } from '@angular/core';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { OrderStatus } from 'src/app/shared/enums/order-status.enum';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  currentSegment: string;

  storeId: string;

  public segmentList: any[] = [
    { label: OrderStatus.All, value: OrderStatus.All },
    { label: OrderStatus.Pending, value: OrderStatus.Pending },
    { label: OrderStatus.Confirmed, value: OrderStatus.Ready },
    { label: OrderStatus.Shipping, value: OrderStatus.Shipping },
    { label: OrderStatus.Delivered, value: OrderStatus.Delivered },
    { label: OrderStatus.Returns, value: OrderStatus.Returns}
  ]

  constructor(private globalEmitter: GlobalEmitterService) {}

  ngOnInit() {
    this.initialize();
    this.globalEmitter.clearOrderCount.emit(true);
    this.getSelectedStoreId();
  }

  private ionViewDidEnter(): void {
    this.getSelectedStoreId();
  }

  private initialize(): void {
    this.currentSegment = OrderStatus.All;
  }

  private getSelectedStoreId(): void {
    this.storeId = localStorage.getItem('selectedStoreId');
  }

  segmentChanged(event: any): void {
    if (this.currentSegment !== event.detail.value) {
      this.currentSegment = event.detail.value;
    }
  }

  changeStoreId(id: string): void {
    this.storeId = id;
  }

  get orderStatus(): any {
    return OrderStatus;
  }
}
