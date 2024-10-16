import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeHtmlTags'
})
export class RemoveHtmlTagsPipe implements PipeTransform {

  transform(value: string) {
    if (value) {
      let result = value.replace(/<\/?[^>]+>/gi, ""); //removing html tag using regex pattern
      return result;
    }
    else {
      // do nothing
    }
  }
}
