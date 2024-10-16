import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-alert-with-image',
  templateUrl: './custom-alert-with-image.component.html',
  styleUrls: ['./custom-alert-with-image.component.scss'],
})
export class CustomAlertWithImageComponent implements OnInit {
  @Input() image: string;
  @Input() text: string;
  @Input() subText: string;
  @Input() btnText: string = 'ok';
  @Input() secondaryBtn: string;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() { }

  public confirmClick(): void {
    this.modalCtrl.dismiss({ status: 'confirm' });
  }

  public dismiss(): void {
    this.modalCtrl.dismiss();
  }
}

