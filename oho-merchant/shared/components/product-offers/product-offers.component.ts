import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AddProductOfferComponent } from '../add-product-offer/add-product-offer.component';
import { ProductService } from 'src/app/services/product.service';
import { plainToClass } from 'class-transformer';
import { Sales } from 'src/app/models/sales.model';
import * as moment from 'moment';
import { ToastService } from 'src/app/services/toast.service';
import { CustomAlertComponent } from 'src/app/ui-shared/components/custom-alert/custom-alert.component';
import { finalize } from 'rxjs/operators';
import { DateFormat } from '../../constants/date';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-product-offers',
  templateUrl: './product-offers.component.html',
  styleUrls: ['./product-offers.component.scss'],
})
export class ProductOffersComponent implements OnInit {
  @Input() productId: number;
  @Input() fromProductDetail: boolean = false;

  public addProperty: boolean = false;
  public pageIndex: number = 1;
  public perPage: number = 10;
  public offers: Sales[] = [];
  public isLoading: boolean = false;
  public totalPageCount: number;

  constructor(
    private modalController: ModalController,
    private navCtrl: NavController,
    private productService: ProductService,
    private toastService: ToastService,
    public utility: UtilityService
  ) { }

  ngOnInit(): void {
    if (this.productId) {
      this.getProductOffers();
    }
  }

  public dismiss(closeAllModal: boolean): void {
    if (closeAllModal) {
      this.modalController.dismiss(true);
    }
    this.modalController.dismiss();
  }

  public async addOffer(offer: Sales = null): Promise<void> {
    const modal = await this.modalController.create({
      component: AddProductOfferComponent,
      cssClass: 'product-modal',
      componentProps: {
        productId: this.productId,
        offer: offer
      }
    });
    modal.onDidDismiss().then((res) => {
      if (res?.data?.isDismissed) {
        this.getProductOffers();
      }
    });
    return await modal.present();
  }

  public getProductOffers(): void {
    this.isLoading = true;
    this.productService.getProductOffers(this.productId, this.pageIndex, this.perPage)
    .pipe(
      finalize(() => { this.isLoading = false })
    )
    .subscribe(
      (res) => {
        if (res?.success) {
          this.offers = plainToClass(Sales, res?.data?.data);
          if (this.offers) {
            this.offers.forEach((element) => {
              element.value = (Number(element?.value) * 100).toFixed().toString();
              if (element?.startAt) {
                element.startAt = this.formatDate(element.startAt);
              }
              if (element?.endAt) {
                element.endAt =this.formatDate(element.endAt);
              }
            });
          }
          this.totalPageCount = res?.data?.totalCount;
        } else {
          this.toastService.presentToast('Could not fetch product offers', 2000);
        }
      },
      (err) => {
        this.toastService.presentToast('Could not fetch product offers', 2000);
      }
    );
  }

  public formatDate(date): string {
    return moment(date).local().format(DateFormat);
  }

  public async deleteOfferConfirm(offerId: number): Promise<void> {
    const modal = await this.modalController.create({
      cssClass: 'alert-modal',
      component: CustomAlertComponent,
      animated: false,
      componentProps: {
        title: 'Confirm Delete',
        text: 'Are you sure you want to delete this note? Please, note you cannot undo this action.'
      }
    })

    modal.onDidDismiss().then((res) => {
      if (res?.data?.status === 'confirm') {
        this.deleteProductOffer(offerId);
      }
    });

    return await modal.present();
  }

  public deleteProductOffer(offerId: number): void {
    this.isLoading = true;
    this.productService.deleteProductOffer(offerId, this.productId)
    .pipe(
      finalize(() => { this.isLoading = false })
    )
    .subscribe(
      (res) => {
        if (res?.success) {
          this.toastService.presentToast('Offer deleted successfully', 2000);
          this.getProductOffers();
        } else {
          this.toastService.presentToast('Could not delete offer', 2000);
        }
      },
      (err) => {
        this.toastService.presentToast('Could not delete offer', 2000);
      }
    );
  }

}
