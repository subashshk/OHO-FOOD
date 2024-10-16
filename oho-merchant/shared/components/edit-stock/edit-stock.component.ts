import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Stock } from 'src/app/models/stock.model';
import { StockService } from 'src/app/services/stock.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-stock',
  templateUrl: './edit-stock.component.html',
  styleUrls: ['./edit-stock.component.scss'],
})
export class EditStockComponent implements OnInit {
  @Input() productId: number;
  @Input() stock: Stock;

  public isBackOrderable: boolean = false;
  public modifier: number = 0;
  public threshold: number  = 0;
  public isLoading: boolean = false;

  constructor(
    private modalController: ModalController,
    private stockService: StockService,
    private toastService: ToastService
  ) { }

  ngOnInit() {}

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public setBackOrderable(event): void {
    this.isBackOrderable = event.detail.checked;
  }

  public changeModifier(event): void {
    this.modifier = event;
  }

  public changeThreshold(event): void {
    this.threshold = event;
  }

  public saveStockData(): void {
    this.isLoading = true;
    this.stock.modify = this.modifier;
    this.stock.threshold = this.threshold;
    this.stock.countOnHand = this.modifier;
    this.stockService.updateStockItem(this.stock?.id, this.stock)
    .pipe(
      finalize(() => { this.isLoading = false; })
    )
    .subscribe(
      (res) => {
        if (res?.data) {
          this.toastService.presentToast('Stock updated successfully', 2000);
          this.dismiss();
        } else {
          this.toastService.presentToast(res?.message, 2000);
        }
      },
      (err) => {
        this.toastService.presentToast('Could not update stock', 2000);
      }
    );
  }

}
