import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChartComponent } from 'ng-apexcharts';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { Phase } from '../../enums/phase.enum';

@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss'],
})
export class ChartCardComponent implements OnInit {
  @ViewChild('chart', { static: false }) chart: ChartComponent;
  @Input() chartOptions: Partial<any>;
  @Input() chartClassName: string;
  @Output() filterEmitter = new EventEmitter();

  public isPhaseOne: boolean = false;

  constructor(
    private modalCtrl: ModalController,
  ) {}

  get seriesLength(): number {
    if (this.chartOptions.series[0] && this.chartOptions.series[0].data) {
      return this.chartOptions.series[0].data.length;
    } else {
      return this.chartOptions.series.length;
    }
  }

  ngOnInit() {
    this.isPhaseOne = localStorage.getItem('phase') === Phase.PhaseOne;
  }

  async openDateRangeModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      cssClass: 'date-range-modal bottom-modal',
      component: DateRangePickerComponent,
    })

    modal.onDidDismiss().then((res) => {
      if(res?.data) {
        this.filterSelected(res?.data);
      }
    })
    return await modal.present();
  }

  public filterSelected(filterString: string): void {
    this.filterEmitter.emit(filterString);
  }
}
