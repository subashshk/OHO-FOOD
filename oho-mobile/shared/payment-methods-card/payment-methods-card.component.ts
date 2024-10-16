import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PaymentMethod } from '@globalEnums/payment-method.enum';

@Component({
  selector: 'app-payment-methods-card',
  templateUrl: './payment-methods-card.component.html',
  styleUrls: ['./payment-methods-card.component.scss'],
})
export class PaymentMethodsCardComponent implements OnInit {
  @Output() selectedMethodEmitter: EventEmitter<any> = new EventEmitter();

  public paymentMethods: Object = [
    {
      title: 'Digital Payment',
      key: 'digital-payment',
      subMethods: [
        {
          img: '../../../assets/images/payment/esewa.png',
          key: PaymentMethod.ESEWA,
        },
        {
          img: '../../../assets/images/payment/khalti.png',
          key: PaymentMethod.KHALTI,
        },
      ],
    },
    {
      title: 'Cash on Delivery',
      key: 'cash_on_delivery',
      img: '../../../assets/images/payment/cash_on_delivery.svg',
    },
    {
      title: 'Virtual Currency',
      key: 'virtual_currency',
      img: '../../../assets/images/payment/virtual_currency.svg',
    },
  ];

  public currentPaymentMethodKey: string = this.paymentMethods[1].key;

  constructor() { }

  ngOnInit(): void {
    this.selectedMethod();
  }

  public setPaymentMethod(method: any): void {
    if (!this.isCurrentPaymentMethod(method)) {
      this.currentPaymentMethodKey = method.key;
      this.selectedMethod();
    }
  }
  
  public selectedMethod(): void {
    this.selectedMethodEmitter.emit(this.currentPaymentMethodKey);
  }

  public isCurrentPaymentMethod(method: any): boolean {
    if (method.key === this.currentPaymentMethodKey) {
      return true;
    }
    if (method.subMethods) {
      return method.subMethods.some(
        (subMethod) => subMethod.key === this.currentPaymentMethodKey
      );
    }
    return false;
  }
}
