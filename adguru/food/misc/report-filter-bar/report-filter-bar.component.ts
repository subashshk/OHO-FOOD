import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { RangeType } from '@globalEnums/range-type.enum';

@Component({
  selector: 'app-report-filter-bar',
  templateUrl: './report-filter-bar.component.html',
  styleUrls: ['./report-filter-bar.component.scss']
})
export class ReportFilterBarComponent implements OnInit {
  public salesDateRange: Date[];
  public ranges: any = {
    'Last 6 Months': this.utility.getPresetRange(RangeType.Last6Months),
    'This Year': this.utility.getPresetRange(RangeType.ThisYear),
    'Last Year': this.utility.getPresetRange(RangeType.LastYear),
  };
  @Input() selectFields: any[];
  @Input() categoryFields: any[];
  @Output() rangeFilter: EventEmitter<Date[]> = new EventEmitter<Date[]>();
  @Output() storeStatus: EventEmitter<string> = new EventEmitter<string>();
  @Output() exportSales: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() categoryStatus: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private utility: UtilityService
  ) { }

  ngOnInit(): void {
    this.salesDateRange = this.utility.getPresetRange(RangeType.LastYear);
  }

  public dateEmitter = (dateRqgne: Date[]): void => {
    this.rangeFilter.emit(this.salesDateRange);
  }

  public handleSearchStr = (str: string): void => {
    this.storeStatus.emit(str);
  }

  public handleExportClicked = (): void => {
    this.exportSales.emit(true);
  }

  public handleCategoryChange = (categoryStr: string): void => {
    this.categoryStatus.emit(categoryStr);
  }
}
