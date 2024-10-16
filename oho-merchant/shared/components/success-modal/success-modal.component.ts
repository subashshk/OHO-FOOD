import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent implements OnInit {
  @Input() titleText: string;
  @Input() subtitle: string;
  @Input() btnText: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  public dismiss(): void {
    this.modalController.dismiss();
  }
}
