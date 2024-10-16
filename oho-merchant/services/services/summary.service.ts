import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { IntervalType } from '../shared/enums/interval-type.enum';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private vendorURL = environment.apiURL + '/vendors/';
  private userUrl = environment.apiURL + '/users/';

  constructor(private http: HttpClient) { }

  private appendStoreId(params: any, storeId: string) {
    if (storeId) {
      params = params.append('store_id', storeId);
    }
    return params;
  }

  public getPerformance(
    userId: string,
    storeId: string,
    from: string,
    to: string
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = this.appendStoreId(params, storeId);
    params = params.append('from', from);
    params = params.append('to', to);
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + userId + '/performance',
      {
        params,
      }
    );
  }

  public getRevenueNetProfit(
    userId: string,
    storeId: any,
    netProfit: boolean,
    from: string,
    to: string,
    filterType: IntervalType
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = this.appendStoreId(params, storeId);
    if (netProfit) {
      params = params.append('net_profit', 'true');
    }
    if (from) {
      params = params.append('from', from);
    }
    if (to) {
      params = params.append('to', to);
    }
    if (filterType) {
      params = params.append('filter_by', filterType);
    }
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + userId + '/revenue',
      {
        params,
      }
    );
  }

  public getCount(
    userId: number,
    storeId: string,
    filterStatus?: any,
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (storeId) {
      params = params.append('store_id', storeId);
    }

    if (filterStatus) {
      params = params.append('filter_by_date', filterStatus);
    }
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + userId + '/get_count',
      {
        params,
      }
    );
  }

  public getOrdersCount(
    userId: number,
    storeId: string,
    state: string
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('store_id', storeId);
    params = params.append('q[state_eq]', state);
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + userId + '/orders_by_status',
      {
        params,
      }
    );
  }
}
