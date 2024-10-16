import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { RangeType } from '../../enums/range-type.enum';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
})
export class DateRangePickerComponent implements OnInit {
  @Input() hasFilter: boolean;
  @Input() isDashboardFilter: boolean = false;
  @Output() filterEmitter = new EventEmitter();

  public customDate = [];
  public ranges: any = {
    'Today ': this.utility.getPresetRange(RangeType.Today),
    'Yesterday ': this.utility.getPresetRange(RangeType.Yesterday),
    'Last 7 Days': this.utility.getPresetRange(RangeType.Last7Days),
    'This Month': this.utility.getPresetRange(RangeType.ThisMonth),
    'Last Month': this.utility.getPresetRange(RangeType.LastMonth),
    'Last 6 Months': this.utility.getPresetRange(RangeType.Last6Months),
    'This Year': this.utility.getPresetRange(RangeType.ThisYear),
    'Last Year': this.utility.getPresetRange(RangeType.LastYear),
  };

  constructor(public utility: UtilityService, public modalCtrl: ModalController) { }

  ngOnInit() {
    if(this.isDashboardFilter) {
      this.ranges = {
        'Today': 'today',
        'This Week': 'this_week',
        'This Month': 'this_month',
        'This Year': 'this_year',
      }
      return;
    }
    this.customDate = this.utility.getPresetRange(RangeType.ThisMonth);
    this.filterEmitter.emit(this.buildStringArray());
  }

  public changeFilter($event): void {
    this.customDate = $event.detail.value;
  }

  public buildStringArray() {
    return [
      this.utility.getUTCStartDateString(this.customDate[0]),
      this.utility.getUTCEndDateString(this.customDate[1]),
    ];
  }

  public confirm(): void {
    this.filterEmitter.emit(this.buildStringArray());
    this.dismiss(this.isDashboardFilter ? this.customDate : this.buildStringArray());
  }

  public dismiss($event?: any): void {
    this.modalCtrl.dismiss($event);
  }

  // Required to override default sorting behavior of keyvalue pipe
  public noSorting(): number {
    return 0;
  }
}
