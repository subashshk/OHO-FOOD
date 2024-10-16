import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { plainToClass } from 'class-transformer';
import { takeUntil } from 'rxjs/operators';
import { Store } from 'src/app/models/store.model';
import { StoreService } from 'src/app/services/store.service';
import { UtilityService } from 'src/app/services/utility.service';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.page.html',
  styleUrls: ['./stores.page.scss'],
})
export class StoresPage extends subscribedContainerMixin() implements OnInit {
  storeList: Store[] = [];
  isLoading: boolean;

  pageIndex = 1;
  perPage = 8;
  totalPageCount: number;

  constructor(
    private navCtrl: NavController,
    private storeService: StoreService,
    public utility: UtilityService
  ) {
    super();
  }

  ngOnInit() {
    this.initialize();
  }

  doRefresh(event): void {
    this.initialize(event);
  }

  initialize(event = null): void {
    this.storeList = [];
    this.isLoading = true;
    this.pageIndex = 1;
    this.getStores();
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 2000);
    }
  }

  getStores(event = null): void {
    this.storeService
      .getStores(this.pageIndex, this.perPage)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.isLoading = false;
          res.data.data.forEach((element) => {
            this.storeList.push(plainToClass(Store, element));
          });
          this.totalPageCount = res.data.totalCount;
          if (event) {
            event.target.complete();
            if (this.storeList.length + this.storeList.length === this.totalPageCount) {
              event.target.disabled = true;
            }
          }
        }
      });
  }

  public storeDetailPage(storeId: number): void {
    this.navCtrl.navigateForward('store-details/' + storeId);
  }

  getMoreStores(event: any): void {
    this.pageIndex += 1;
    this.getStores(event);
  }

  openStore(id: number): void {
    this.navCtrl.navigateForward('documentation/' + id);
  }

  public navigateTo(url: string): void {
    if (url) {
      this.navCtrl.navigateForward(url);
    }
  }
}
