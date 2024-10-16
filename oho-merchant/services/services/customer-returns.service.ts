import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SortStatus } from '../shared/enums/sort-status';
import { ReturnDetail } from '../models/return-details.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerReturnsService {

  public returnURL: string = environment.apiURL + '/return/';
  public returnProductListURL = environment.apiURL + "/return/return_items/";

  constructor(private http: HttpClient) { }

  public getReturnRequestList(
    page?: number,
    perPage?: number,
    search?: string,
    sortParams?: any,
    verifiedOnly?: boolean
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    if (verifiedOnly) {
      params = params.append('verified_only', verifiedOnly);
    }
    if (search) {
      params = params.append(
        'q[number_or_return_items_inventory_unit_order_user_first_name_or_return_items_inventory_unit_order_user_middle_name_or_return_items_inventory_unit_order_user_last_name_cont]',
        search
      );
    }
    if (sortParams && sortParams.order !== SortStatus.None) {
      params = params.append('q[s]', sortParams.type + ' ' + sortParams.order);
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      this.returnURL + 'customer_returns',
      { params }
    );
  }

  public getCustomerReturnDetails(
    customerReturnId: number
  ): Observable<ApiResponse<ReturnDetail>> {
    return this.http.get<ApiResponse<ReturnDetail>>(
      this.returnURL + 'customer_returns/' + customerReturnId
    );
  }

  public approveReturnItem(returnItemId: number, payload, actionPerformed?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (actionPerformed) {
      params = params.append('action_performed', actionPerformed);
    }
    return this.http.post<ApiResponse<any>>(
      this.returnProductListURL + returnItemId + '/accept_or_reject_by_vendor/', payload, {
        params
      }
    );
  }

  public refuseReturnItem(returnItemId: number, payload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.returnProductListURL + returnItemId + '/reject_by_vendor/', payload
    );
  }
}
