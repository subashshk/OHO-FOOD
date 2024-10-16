import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Review } from 'src/app/models/review.model';
import { WriteReviewComponent } from '../write-review/write-review.component';

@Component({
  selector: 'app-rating-review',
  templateUrl: './rating-review.component.html',
  styleUrls: ['./rating-review.component.scss'],
})
export class RatingReviewComponent implements OnInit {
  @Input() showCustomerImages = false;
  @Input() showWriteReview = false;
  @Input() product: any;
  @Input() reviews: Review[] = [];
  @Input() canReview = true;
  @Output() reviewChangeEmitter = new EventEmitter();

  isLoading = true;
  modal: any;

  progressColors = ['success', 'tertiary', 'primary', 'warning', 'danger'];

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  getProgressBarValue(rate: number): number {
    if (this.product.specificRating[rate] === 0) {
      return 0;
    }
    return this.product.specificRating[rate] / this.product.ratingCount;
  }

  async showReviewModal() {
    this.modal = await this.modalController.create({
      component: WriteReviewComponent,
      cssClass: 'write-review-modal',
      componentProps: {
        product: this.product,
      },
    });
    this.modal.onDidDismiss().then((res) => {
      if (res.data.saved) {
        this.reviewChangeEmitter.emit();
      }
    });
    return await this.modal.present();
  }
}
