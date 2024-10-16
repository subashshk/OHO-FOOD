import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'snakeToCamel'
})
export class SnakeToCamelPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/_([a-z])/g, (_, match) => match.toUpperCase());
  }
}
