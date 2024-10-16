import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-order-confirm',
  templateUrl: './order-confirm.page.html',
  styleUrls: ['./order-confirm.page.scss'],
})
export class OrderConfirmPage implements OnInit {
  constructor(private nav: NavController) {}

  ngOnInit() {}

  navigateToOrder() {
    this.nav.navigateRoot('tabs/account').then(() => {
      this.nav.navigateForward('orders');
    });
  }
}
