import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-set-location',
  templateUrl: './set-location.component.html',
  styleUrls: ['./set-location.component.scss'],
})
export class SetLocationComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  public dismiss(locationType: string = null): void {
    this.modalController.dismiss({ locationType: locationType });
  }

  public setLocation(locationType: string = null): void {
    this.dismiss(locationType);
  }

}
