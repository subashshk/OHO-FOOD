import { Component, Input, OnInit } from '@angular/core';
import { StockService } from 'src/app/services/stock.service';
import { SortStatus } from '../../enums/sort-status';
import { Stock } from 'src/app/models/stock.model';
import { ModalController } from '@ionic/angular';
import { UtilityService } from 'src/app/services/utility.service';
import { EditStockComponent } from '../edit-stock/edit-stock.component';
import { ToastService } from 'src/app/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss'],
})
export class StocksComponent implements OnInit {
  @Input() productId: number;

  public perPage = 10;
  public currentPage = 1;
  public totalCount = 20;
  private userId: string;
  private vendorId: string;
  public storeId = '';
  public searchParams = '';
  public isLoading = false;
  public dataSet: Stock[] = [];
  public isBackorderable: boolean;
  public sortStatus: { columnName: string; order: SortStatus } = {
    columnName: '',
    order: SortStatus.None,
  };

  constructor(
    private stockService: StockService,
    private modalController: ModalController,
    public utility: UtilityService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setUserId();
    this.populateStockList();
  }

  private setUserId(): void {
    this.userId = JSON.parse(localStorage.getItem('currentUser')).id;
    if(JSON.parse(localStorage.getItem('currentUser')).vendor){
      this.vendorId = JSON.parse(localStorage.getItem('currentUser')).vendor
    }else{
      this.vendorId = this.userId;
    }
  }

  public populateStockList(): void {
    this.isLoading = true;
    if (this.searchParams) {
      this.searchParams = this.searchParams.trim();
    }
    this.stockService
      .getOrderDetails(
        this.vendorId,
        this.storeId,
        this.searchParams,
        this.perPage,
        this.currentPage,
        this.productId,
        this.sortStatus,
        this.isBackorderable
      ).pipe(
        finalize(() => { this.isLoading = false })
      )
      .subscribe((res) => {
        if (res?.success) {
          this.dataSet = res?.data?.data;
          this.totalCount = res?.data?.totalCount;
          this.formatDataSet();
        } else {
          this.toastService.presentToast('Failed to fetch product stock', 2000);
        }
      },
      (err) => {
        this.toastService.presentToast('Failed to fetch product stock', 2000);
      });
  }

  private formatDataSet(): void {
    this.dataSet.forEach((data) => {
      data.modify = 0;
    });
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public async editStock(stock): Promise<void> {
    const modal = await this.modalController.create({
      component: EditStockComponent,
      cssClass: 'product-modal',
      componentProps: {
        productId: this.productId,
        stock: stock
      },
    });
    modal.onDidDismiss().then((res) => {
      this.populateStockList();
    });
    return await modal.present();
  }
}
