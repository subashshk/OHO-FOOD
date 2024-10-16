import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { plainToClass } from 'class-transformer';
import { takeUntil } from 'rxjs/operators';
import { Store } from 'src/app/models/store.model';
import { DataService } from 'src/app/services/data.service';
import { StoreService } from 'src/app/services/store.service';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { AddStoreComponent } from '../add-store/add-store.component';
import { DashboardType } from '../../enums/dashboard-type.enum';
import { PlatformServices } from '../../enums/services.enum';
import { CompanyDetailsComponent } from 'src/app/jobs/jobs-shared/components/company-details/company-details.component';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.scss'],
})
export class StoreListComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  public stores = [];
  public currentStoreId: string;
  public isLoading = false;
  public currentDashboardName: string;
  public isProcessing: boolean = false;

  constructor(
    private storeService: StoreService,
    private modalController: ModalController,
    private dataService: DataService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getStores();
    this.dataService.dashboardChange.subscribe((res) => {
      this.currentDashboardName = res?.dashboardName
    })
  }

  private getStores(): void {
    this.isLoading = true;
    this.storeService
      .getStores()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.data.data) {
          const storeList = plainToClass(Store, res.data.data);
          storeList.forEach((element) => {
            this.stores.push({
              id: element.id.toString(),
              name: element.name,
              serviceType: element.serviceType,
              currentUserRole: element.currentUserRole,
              logo: element.logo,
            });
          });
          if(this.currentDashboardName === DashboardType.Store) {
            this.stores = this.stores.filter(
              (store) => (store.serviceType === PlatformServices.Mall || store.serviceType === PlatformServices.Mart)
            );
          } else {
            this.stores = this.stores.filter((store) => store.serviceType === this.currentDashboardName);
          }
          let index = 0;
          this.currentStoreId = this.stores[index]?.id.toString();
          localStorage.removeItem('selectedStoreId');
          localStorage.setItem('selectedStoreId', this.currentStoreId);
          this.isLoading = false;
        }
      });
  }

  public setStore(store: any): void {
    this.currentStoreId = store?.detail?.value;
  }

  public changeStore(): void {
    this.isProcessing = true;
    localStorage.removeItem('selectedStoreId');
    localStorage.setItem('selectedStoreId', JSON.parse(this.currentStoreId));
    this.dataService.changeStore(this.currentStoreId);
    this.isProcessing = false;
    this.dismiss();
  }

  public async presentAddStoreModal(): Promise<void> {
    if(this.currentDashboardName === DashboardType.Jobs) {
      const modal = await this.modalController.create({
        component: CompanyDetailsComponent,
        cssClass: 'alert-controller',
        componentProps: {
          step: 1,
          fromDashboard: true,
        },
      });
      modal.onDidDismiss().then((res) => {
        this.ngOnInit();
      });
      this.dismiss();
      return await modal.present();
    } else {
      const modal = await this.modalController.create({
        component: AddStoreComponent,
        cssClass: 'alert-controller',
        componentProps: {
          step: 1,
          fromDashboard: true,
        },
      });
      modal.onDidDismiss().then((res) => {
        this.ngOnInit();
      });
      this.dismiss();
      return await modal.present();
    }
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }
}
