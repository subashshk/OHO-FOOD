import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderScore',
})
export class RemoveUnderScorePipe implements PipeTransform {
  transform(value: string, args?: any): any {
    return value ? value.replace(/_/g, ' ') : '';
  }
}
