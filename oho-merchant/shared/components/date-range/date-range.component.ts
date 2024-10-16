import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
})
export class DateRangeComponent implements OnInit {
  @Input() stDate = '';
  @Input() endDate = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  saveStartDate(event: any): void {
    this.stDate = event.detail.value;
  }

  saveEndDate(event: any): void {
    this.endDate = event.detail.value;
  }

  confirm(): void {
    this.modalController.dismiss({
      stDate: this.stDate,
      endDate: this.endDate,
    });
  }

  cancel(): void {
    this.modalController.dismiss();
  }
}
