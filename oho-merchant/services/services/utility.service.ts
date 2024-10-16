import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { IntervalType } from '../shared/enums/interval-type.enum';
import * as moment from 'moment';
import { RangeType } from '../shared/enums/range-type.enum';
import { AngularTokenService } from 'angular-token';
import { PlatformServices } from '../shared/enums/services.enum';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private tokenService: AngularTokenService) {}

  getImage(imageSrc: string, logo: boolean = false): string {
    let src = '';
    if (imageSrc) {
      src = environment.imageURL + imageSrc;
    } else {
      if (logo) {
        src = '/assets/images/no-image-logo.png';
      } else {
        src = '/assets/images/no-image.png';
      }
    }
    return src;
  }

  trimInput(formGroup: FormGroup, controlName?: string[]): void {
    if (controlName) {
      controlName.forEach((key) => {
        if (formGroup.controls[key].value) {
          formGroup.controls[key].setValue(formGroup.controls[key].value.trim());
        }
      });
    } else {
      Object.keys(formGroup.controls).forEach((key) => {
        if (formGroup.controls[key].value) {
          formGroup.controls[key].setValue(formGroup.controls[key].value.trim());
        }
      });
    }
  }

  getIntervalType(dateA: string, dateB: string): IntervalType {
    if (moment(dateB).diff(moment(dateA), 'days') > 31) {
      return IntervalType.Month;
    } else {
      return IntervalType.Daily;
    }
  }

  getDateString(date: string, increment: string): string {
    if (increment === 'day') {
      return moment(date).format('MMM DD');
    } else {
      return moment(date).format('MMM');
    }
  }

  mapData(data: any, stDate: string, endDate: string): any {
    let returnData = {};
    const increment =
      this.getIntervalType(stDate, endDate) === IntervalType.Daily ? 'day' : 'month';
    for (
      let index = moment(stDate).format('YYYY-MM-DD');
      index <= moment(endDate).format('YYYY-MM-DD');
      index = moment(index).add(1, increment).format('YYYY-MM-DD')
    ) {
      if (!data.hasOwnProperty(index)) {
        returnData[this.getDateString(index, increment)] = {};
      } else {
        returnData[this.getDateString(index, increment)] = data[index];
      }
    }
    return returnData;
  }

  b64toBlob(b64Data, contentType = '', sliceSize = 512): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  getPresetRange(type: RangeType): Date[] {
    let range: Date[] = [];
    switch (type) {
      case RangeType.Today:
        range = [new Date(), new Date()];
        break;
      case RangeType.Yesterday:
        range = [
          new Date(moment().subtract(1, 'day').format()),
          new Date(moment().subtract(1, 'day').format()),
        ];
        break;
      case RangeType.Last7Days:
        range = [new Date(moment().subtract(7, 'days').format()), new Date()];
        break;
      case RangeType.ThisMonth:
        range = [
          new Date(moment().startOf('month').format()),
          new Date(moment().endOf('month').format()),
        ];
        break;
      case RangeType.LastMonth:
        range = [
          new Date(moment().subtract(1, 'month').startOf('month').format()),
          new Date(moment().subtract(1, 'month').endOf('month').format()),
        ];
        break;
      case RangeType.Last6Months:
        range = [
          new Date(moment().subtract(6, 'month').startOf('month').format()),
          new Date(moment().subtract(1, 'month').endOf('month').format()),
        ];
        break;
      case RangeType.ThisYear:
        range = [
          new Date(moment().startOf('year').format()),
          new Date(moment().endOf('year').format()),
        ];
        break;
      case RangeType.LastYear:
        range = [
          new Date(moment().subtract(1, 'year').startOf('year').format()),
          new Date(moment().subtract(1, 'year').endOf('year').format()),
        ];
        break;
    }
    return range;
  }

  getUTCStartDateString(date: any): string {
    return moment(date).startOf('day').utc().format();
  }

  getUTCEndDateString(date: any): string {
    return moment(date).endOf('day').utc().format();
  }

  checkIsLoggedIn(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tokenService.validateToken().subscribe(
        (res) => {
          if (res.success) {
            resolve(true);
          }
          reject();
        },
        (err) => {
          reject();
        }
      );
    });
  }

  public getCurrentServiceType(): PlatformServices {
    const currentService = localStorage.getItem('currentServiceType') as PlatformServices;
    if (currentService) {
      return currentService;
    }
    return PlatformServices.All;
  }

  /**
   * checks if current service type is food
   *
   * @returns { Boolean } - true if current service type is from food
   */
  public isFood(): boolean {
    return this.getCurrentServiceType() === PlatformServices.Food;
  }
}
