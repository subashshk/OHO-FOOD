import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/shared/models/api-response.model';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { PaginatedApiResponse } from 'src/app/shared/models/paginated-api-response.model';
import { PlatformServices } from '@globalEnums/services.enum';
import { SortStatus } from '@globalEnums/sort-status.enum';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private rootUrl: string = environment.apiURL + '/admin/'
  private storesUrl: string = environment.apiURL + '/vendor/stores';

  constructor(
    private http: HttpClient,
    private utility: UtilityService
  ) { }

  public getAllOrders = (
    perPage: number = 10,
    pageIndex: number = 1,
    status?: string,
    orderNameId?: string,
    serviceType?: string,
    dateRange?: Date[]
  ): Observable<ApiResponse<any>> => {
    let params = new HttpParams();
    params = params.append('page', pageIndex);
    params = params.append('per_page', perPage);

    if (status) {
      params = params.append('q[state_eq]', status);
    }
    if (dateRange) {
      const startDate: string = this.utility.getUTCStartDateString(dateRange[0]);
      const endDate: string = this.utility.getUTCEndDateString(dateRange[1]);
      params = params.append('q[created_at_lteq]', endDate);
      params = params.append('q[created_at_qteq]', startDate);
    }
    if (orderNameId) {
      params = params.append('q[customer_name_or_order_number]', orderNameId);
    }
    if (serviceType) {
      params = params.append('service_type', serviceType);
    }
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + 'orders/',
      { params }
    );
  }

  public getAllProducts = (
    perPage: number = 10,
    pageIndex: number = 1,
    status?: string,
    dateRange?: Date[],
    serviceType?: string,
    search?: string,
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> => {
    let params = new HttpParams();
    params = params.append('page', pageIndex);
    params = params.append('per_page', perPage);
    if (status) {
      params = params.append('q[status_eq]', status);
    }
    if (dateRange) {
      const startDate: string = this.utility.getUTCStartDateString(dateRange[0]);
      const endDate: string = this.utility.getUTCEndDateString(dateRange[1]);
      params = params.append('q[created_at_qteq]', startDate);
      params = params.append('q[created_at_lteq]', endDate);
    }
    if (serviceType) {
      params = params.append('service_type', serviceType);
    }
    if (search) {
      params = params.append('q[name_or_master_sku_cont]', search);
    }

    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      this.rootUrl + 'products',
      { params }
    )
  }

  public getDashboardCounts = (
    serviceType?: string
  ): Observable<ApiResponse<any>> => {
    let params = new HttpParams();
    params = params.append('service_type', serviceType);
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + 'count',
      { params }
    );
  }

  public getSalesOverviewData = (
    dateRange?: Date[],
    filterBy?: string,
    perPage: number = 4,
    serviceType: string = 'food',
    sortParams?: any
  ): Observable<ApiResponse<any>> => {
    let params = new HttpParams();
    params = params.append('per_page', perPage);
    params = params.append('service_type', serviceType);
    if (dateRange) {
      const startDate: string = this.utility.getUTCStartDateString(dateRange[0]);
      const endDate: string = this.utility.getUTCEndDateString(dateRange[1]);
      params = params.append('from', startDate);
      params = params.append('to', endDate);
    }
    if (filterBy) {
      params = params.append('filter_by', filterBy);
    }
    if (sortParams && sortParams.order !== SortStatus.None) {
      params = params.append('sort', sortParams.type + ' ' + sortParams.order);
    }
    return this.http.get<ApiResponse<any>>(
      this.rootUrl + 'sales_over_time',
      { params }
    );
  }

  public getTopSalesData = (
    dateRange?: Date[],
    salesType?: string,
    taxonCategory?: boolean,
    perPage: number = 4,
    pageIndex: number = 1,
    filterByVendor?: string,
    filterByCategory?: string,
    serviceType: string = 'food',
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> => {
    let params = new HttpParams();
    params = params.append('page', pageIndex);
    params = params.append('per_page', perPage);
    if (dateRange?.length > 0) {
      let startDate = this.utility.getUTCStartDateString(dateRange[0]);
      let endDate = this.utility.getUTCEndDateString(dateRange[1]);
      params = params.append('from', startDate);
      params = params.append('to', endDate);
    }
    if (taxonCategory) {
      params = params.append('taxonomy', 'categories');
    }
    if (filterByVendor) {
      params = params.append('q[id_eq]', filterByVendor);
    }
    if (filterByCategory) {
      params = params.append('q[id_eq]', filterByCategory);
    }
    if (serviceType) {
      params = params.append('service_type', serviceType);
    }
    params = params.append('q[s]', 'quantity desc');

    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      this.rootUrl + salesType,
      { params }
    );
  }

  public getPromotions = (
    serviceType?: string,
    searchStr?: string,
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> => {
    let params = new HttpParams();
    if (serviceType) {
      params = params.append('service_type', serviceType);
    }
    if (searchStr) {
      params = params.append('q[promotions_name_cont]', searchStr);
    }

    return this.http.get<ApiResponse<any>>(
      this.rootUrl + 'promotions/stores',
      { params }
    )
  }

  public getPromotionsOfStores = (
    storeId: string,
    serviceType?: string,
    dateRange?: Date[],
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> => {
    let params = new HttpParams();
    params = params.append('q[service_type_eq]', serviceType);
    params = params.append('store_id', storeId);

    if (serviceType) {
      params = params.append('q[service_type_eq]', serviceType);
    }
    if (dateRange?.length > 0) {
      let startDate = this.utility.getUTCStartDateString(dateRange[0]);
      let endDate = this.utility.getUTCEndDateString(dateRange[1]);
      params = params.append('from', startDate);
      params = params.append('to', endDate);
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      environment.apiURL + '/promotions',
      { params }
    );
  }

  public getProductInfo = (
    storeId: string,
    productId: string
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> => {
    let params = new HttpParams();
    params = params.append('store_id', storeId);
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      environment.apiURL + '/vendors/' + productId + '/products',
      { params }
    );
  }

  public getStores = (
    perPage: number = 10,
    pageIndex: number = 1,
    searchText?: string,
    status?: string,
    serviceType?: string,
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> => {
    let params = new HttpParams();
    params = params.append('page', pageIndex);
    params = params.append('per_page', perPage);
    if (searchText) {
      params = params.append('q[name_cont]', searchText);
    }
    if (status) {
      params = params.append('q[verification_status_eq]', status);
    }
    if (serviceType) {
      params = params.append('q[service_type_eq]', serviceType);
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      this.storesUrl,
      { params }
    )
  }

  public getAllFoodStores(
    perPage: number = 10,
    pageIndex: number = 1,
    searchText?: string,
    status?: string,
    serviceType?: string
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);
    params = params.append('per_page', perPage);
    if (searchText) {
      params = params.append('q[name_cont]', searchText);
    }
    if (status) {
      params = params.append('q[verification_status_eq]', status);
    }
    if (serviceType) {
      params = params.append('q[service_type_eq]', serviceType);
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(this.rootUrl + '/stores', { params });
  }

  public getCourierRidesOverview = (
    dateRange: Date[],
    filterBy: string,
    serviceType: string,
  ): Observable<ApiResponse<any>> => {
    let params = new HttpParams();
    params = params.append('from', this.utility.getUTCStartDateString(dateRange[0]));
    params = params.append('to', this.utility.getUTCEndDateString(dateRange[1]));
    params = params.append('filter_by', filterBy);
    params = params.append('q[delivery_delivery_type_eq]', serviceType);

    return this.http.get<ApiResponse<any>>(
      this.rootUrl + 'rides_over_time',
      { params }
    )
  }
}
