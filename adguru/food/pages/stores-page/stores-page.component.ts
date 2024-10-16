import { Component, OnInit } from '@angular/core';
import { ProductStatus } from '../../enums/food.enum';
import { finalize } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd';
import { FoodService } from '../../services/food.service';
import { PlatformServices } from '@globalEnums/services.enum';
import { ActivatedRoute, Router } from '@angular/router';

interface Actions {
  title: string;
  type: string;
}
@Component({
  selector: 'app-stores-page',
  templateUrl: './stores-page.component.html',
  styleUrls: ['./stores-page.component.scss']
})
export class StoresPageComponent implements OnInit {
  public breadcrumbs: {
    name: string;
    route: ''
  }[] = [
    { name: 'Stores', route: '' },
    { name: 'All Stores', route: '' }
  ];
  public showFilter: boolean = false;
  public searchStr: string;
  public statusFilter: string;
  public pageIndex: number = 1;
  public perPage: number = 10;
  public filterStr: string;
  public orderStatusSelect: any = {
    placeholder: 'Status Filter: All',
    options: [
      { label: 'Verified', value: ProductStatus.Verified },
      { label: 'Pending', value: ProductStatus.Pending },
      { label: 'Denied', value: ProductStatus.Denied },
    ]
  }
  public totalCount: number = 10;
  public isLoading: boolean = false;
  public storesList: any[];
  public currentServiceType: string;
  public moreActions: Actions = {
    title: 'View Details',
    type: 'view-details',
  }
  public ownerStoreListing: Actions = {
    title: 'Store Listing',
    type: 'store-listing',
  }

  constructor(
    private service: FoodService,
    private notification: NzNotificationService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkRoute();
    this.fetchStores();
  }

  public toggleFilter = (filterFlag: boolean): void => {
    this.showFilter = filterFlag;
  }

  public handleSearch = (str: string): void => {
    this.searchStr = str;
    this.fetchStores();
  }

  public handleFilter = (filterStr: string): void => {
    this.filterStr = filterStr;
    this.fetchStores()
  }

  public resetFilter = (): void => {
    this.filterStr = null;
    this.fetchStores();
  }

  public listActions = (): any => {
    return [this.moreActions, this.ownerStoreListing];
  }

  public moreAction = (event: any, merchant: any): void => {
    if(event.type === 'store-listing') {
      this.router.navigate(['oho/merchants/owner-store-listing/'])
    }
    if(event.type === 'view-details') {
      this.router.navigate(['oho/merchants/store-details/' + merchant?.id]);
    }
  }

  public handlePerPageChanged = (newPerPage: number): void => {
    this.perPage = newPerPage;
    this.fetchStores();
  }

  public handlePageChange = (pageNumber: number): void => {
    this.pageIndex = pageNumber;
    this.fetchStores();
  }

  public fetchStores = (): void => {
    this.isLoading = true;
    this.service.getAllFoodStores(
      this.perPage,
      this.pageIndex,
      this.searchStr,
      this.filterStr,
      this.currentServiceType
    )
    .pipe(finalize(() => { this.isLoading = false }))
    .subscribe(res => {
      if (res?.success) {
        this.totalCount = res?.data?.totalCount;
        this.storesList = res?.data?.data;
      }
    }, err => {
      this.notification.create(
        'error',
        'Error',
        'Could not fetch stores'
      );
    });
  }

  public checkRoute = (): void => {
    this.activeRoute.data.subscribe(data => {
      this.currentServiceType = data?.routeData;
    })
  }
}
