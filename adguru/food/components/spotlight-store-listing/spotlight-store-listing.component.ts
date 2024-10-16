import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfficialStatus } from '@globalEnums/official-status.enum';
import { failedToSave } from '@globalStrings/strings';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';
import { StoreSectionService } from 'src/app/modules/admin/services/store-section.service';
@Component({
  selector: 'app-spotlight-store-listing',
  templateUrl: './spotlight-store-listing.component.html',
  styleUrls: ['./spotlight-store-listing.component.scss']
})
export class SpotlightStoreListingComponent implements OnInit {
  public isLoading: boolean = false;
  public title: string;
  public storeListingData: any[] = [];
  public perPage: number = 10;
  public pageIndex: number = 1;
  public breadcrumbs: {
    name: string;
    route: string;
  }[] = [
    { name: 'Store Sections', route: '' },
    { name: 'Spotlight', route: '' }
  ];
  public secitonId: string;
  public officialStatus: typeof OfficialStatus = OfficialStatus;

  constructor(
    private activeRoute: ActivatedRoute,
    private service: StoreSectionService,
    private notification: NzNotificationService,
    public modalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.secitonId = this.activeRoute.snapshot.paramMap.get('id');
    this.getStoreSectionDetails();
    this.getStoreData();
  }

  public changeStatus(status: boolean, storeId?: number, i?: number): void {
    if (status) {
      this.modalService.warning({
        nzTitle: 'Warning',
        nzContent:
          'Only one store can be active in Spotlight at a time. Are you sure you want to continue?',
        nzOkText: 'Yes',
        nzCancelText: 'No',
        nzOkType: 'danger',
        nzWidth: '42%',
        nzOnOk: () => this.toggleStatus(status, storeId, i),
        nzOnCancel: () => this.getStoreData(),
      });
    } else {
      this.toggleStatus(status, storeId, i);
    }
  }

  public toggleStatus(status: boolean, requestId: number, i: number): void {
    this.isLoading = true;
    this.service.updateRequest(requestId, { status: status })
    .pipe(finalize(() => this.isLoading = false))
    .subscribe(
      (res) => {
        if (res?.success) {
          this.notification.create('success', 'Success', 'Store Listing request updated.');
          this.getStoreData();
        } else {
          this.notification.create('error', failedToSave.title, failedToSave.message);
        }
      },
      (err) => {
        this.notification.create('error', failedToSave.title, failedToSave.message);
      }
    );
  }

  public getStoreSectionDetails = (): void => {
    this.isLoading = true;
    this.service.getStoreSection(+this.secitonId)
      .pipe(finalize(() => { this.isLoading = false }))
      .subscribe(res => {
        if (res?.success) {
          this.title = res?.data?.name + ' - Store listing' ;
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'An error occured while fetching store section data'
        );
      });
  }

  public getStoreData = (): void => {
    this.isLoading = true;
    this.service.getStoreSectionRequests(
      this.pageIndex,
      this.perPage,
      +this.secitonId
    )
    .pipe(finalize(() => { this.isLoading = false }))
    .subscribe(res => {
      if (res?.success) {
        this.storeListingData = res?.data?.data;
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'An error occured while fetching store section data'
      )
    })
  }

  public approveRequest = (requestId: number): void => {
    this.isLoading = true;
    this.service.approveRequest(requestId)
      .pipe(finalize(() => { this.isLoading = false }))
      .subscribe(res => {
        if (res?.success) {
          this.notification.create(
            'success',
            'Success',
            'Store listing request approved.'
          );
          this.getStoreData();
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'Could not approve the request'
        );
      });
  }

  public rejectRequest = (requestId: number): void => {
    this.isLoading = true;
    this.service.rejectRequest(requestId)
      .pipe(finalize(() => { this.isLoading = false }))
      .subscribe(res => {
        if (res?.success) {
          this.notification.create(
            'success',
            'Success',
            'Store listing request rejected'
          );
          this.getStoreData();
        }
      }, err => {
        this.notification.create(
          'error',
          'Error',
          'Could not reject the request'
        );
      });
  }
}
