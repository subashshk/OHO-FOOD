import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Store } from 'src/app/models/store.model';
import { StoreService } from 'src/app/services/store.service';
import { ToastService } from 'src/app/services/toast.service';
import { UtilityService } from 'src/app/services/utility.service';
import { StoreStatus } from 'src/app/shared/enums/store-status.enum';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.page.html',
  styleUrls: ['./store-details.page.scss'],
})
export class StoreDetailsPage implements OnInit {
  public storeId: number;
  public store: Store;
  public isLoading: boolean = false;
  public isPhysicalStore: boolean = false;
  public storeOutlets: any[] = [];

  constructor(
    private navCtrl: NavController,
    public utility: UtilityService,
    private route: ActivatedRoute,
    private storeService: StoreService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.storeId = Number(this.route.snapshot.params.id);
    this.route.queryParams.subscribe(params => {
      if (params?.isPhysicalStore) {
        this.isPhysicalStore = params?.isPhysicalStore;
      }
    })
    this.getStoreDetail();
  }

  public back(): void {
    this.navCtrl.back();
  }

  public navigateToEmployees(index: number, outletId: number): void {
    this.navCtrl.navigateForward('users', {
      queryParams: { isOutletEmployee: true, title: index, outletId }
    });
  }

  public editDetails(): void {
    // edit details
  }

  public getStoreDetail(): void {
    this.isLoading = true;
    this.storeService.getStore(this.storeId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe((res) => {
        this.store = res;
        res?.addresses.forEach(address => {
          this.storeOutlets.push(address);
        })
      },
        (err) => {
          this.toastService.presentToast('Failed to fetch the store details', 2000);
        })
  }

  public mapStoreDetails(): any {
    return {
      'Proprietor Name': this.store?.proprietorName ?? '--',
      'Company Name': this.store?.name ?? '--',
      'Mobile Number': this.store?.mobileNumber ?? '--',
      'Email': this.store?.email ?? '--',
      'VAT/PAN Reg No.': this.store?.panNumber ?? '--',
      'Status': this.store?.verificationStatus ?? '--'
    }
  }

  // required to overwrite the default sorting behaviour of keyvalue pipe
  public noSorting(): number {
    return 0;
  }
}
