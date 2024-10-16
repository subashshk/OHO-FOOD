import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Steps } from '../../constants/steps';
import { DataService } from 'src/app/services/data.service';
import { DashboardType } from '../../enums/dashboard-type.enum';

@Component({
  selector: 'app-circular-stepper',
  templateUrl: './circular-stepper.component.html',
  styleUrls: ['./circular-stepper.component.scss'],
})
export class CircularStepperComponent implements OnInit {
  @Input() stepCount: number = 1;
  @Input() stepTitle: string = '';
  @Input() totalSteps: number;

  public progressPercent:number = 0;
  public isRealEstate: boolean = false;
  public isJobs: boolean = false;

  constructor(
    private utility: UtilityService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.onPageCompleted();
    this.dataService.dashboardChange.subscribe((res) => {
      this.isRealEstate = (res?.dashboardName === DashboardType.RealEstateCompany);
      this.isJobs = (res?.dashboardName === DashboardType.Jobs);
    })
  }

  public onPageCompleted(): void {
    this.progressPercent = (this.stepCount/this.totalSteps) * 100;
  }

}
