import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-rate-rider',
  templateUrl: './rate-rider.component.html',
  styleUrls: ['./rate-rider.component.scss'],
})
export class RateRiderComponent implements OnInit {
  rate = 0;
  review = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onModelChange(event: number): void {
    this.rate = event;
  }

  reviewChange(event: any): void {
    this.review = event.detail.value;
  }

  buttonClick(): void {
    if (this.rate > 0) {
      this.modalController.dismiss({
        rate: this.rate,
        review: this.review,
      });
    }
  }
}
