import { Injectable } from '@angular/core';
import { CaseType } from '../shared/enums/case-type.enum';

@Injectable({
  providedIn: 'root',
})
export class KeyFormatterService {
  constructor() {}

  // to convert the snake case object key to camel case
  private toCamel = (s) => {
    return s.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace('_', '');
    });
  };

  private toSnake = (s) => {
    return s
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join('_');
  };

  private isArray(a) {
    return Array.isArray(a);
  }

  private isObject(o) {
    return o === Object(o) && !this.isArray(o) && typeof o !== 'function';
  }

  public convertKeys(o, destinationFormat = CaseType.Snake.toString()) {
    let fn;
    if (destinationFormat === CaseType.Snake) {
      fn = this.toSnake;
    } else if (destinationFormat === CaseType.Camel) {
      fn = this.toCamel;
    }
    if (this.isObject(o)) {
      const n = {};

      Object.keys(o).forEach((k) => {
        n[fn(k)] = this.convertKeys(o[k], destinationFormat);
      });

      return n;
    } else if (this.isArray(o)) {
      return o.map((i) => {
        return this.convertKeys(i, destinationFormat);
      });
    }
    return o;
  }
}
