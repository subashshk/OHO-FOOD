import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { WriteReviewComponent } from 'src/app/shared/components/write-review/write-review.component';
import { PlatformServices } from '@globalEnums/services.enum';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  styleUrls: ['./review-item.component.scss'],
})
export class ReviewItemComponent implements OnInit {
  @Input() product: any;
  @Input() isReviewModal = false;
  @Input() isLoading: boolean = false;
  modal: any;
  public platformServices = PlatformServices;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  async showReviewModal() {
    this.modal = await this.modalController.create({
      component: WriteReviewComponent,
      cssClass: 'write-review-modal',
      componentProps: {
        productId: this.product.id,
        storeId: this.product.storeId,
        product: this.product,
      },
    });
    return await this.modal.present();
  }

  public isHotel(): boolean {
    return this.product?.serviceType === this.platformServices.Hotel;
  }
}
