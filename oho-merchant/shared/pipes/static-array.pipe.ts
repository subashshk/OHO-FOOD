import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'staticArray'
})
export class StaticArrayPipe implements PipeTransform {

  transform(num: number) {
    return new Array(num).fill(0)
    .map((n, index) => index + 1);
  }

}
