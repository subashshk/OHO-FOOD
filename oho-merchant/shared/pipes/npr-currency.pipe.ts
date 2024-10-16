import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'nprCurrency',
})
export class NprCurrencyPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  currencyCode = 'NPR';
  displayString = 'Rs. ';
  format = '1.0-0';

  transform(value: any, ...args: any[]): any {
    return this.currencyPipe.transform(
      value,
      this.currencyCode,
      this.displayString,
      this.format
    );
  }
}
