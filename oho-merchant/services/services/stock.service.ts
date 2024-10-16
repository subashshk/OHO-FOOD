import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SortStatus } from '../shared/enums/sort-status';
import { StockResponse } from '../models/stock-response.model';
import { Stock } from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private vendorURL = environment.apiURL + '/vendors/';

  constructor(private http: HttpClient) {}

  private appendStoreId(params: any, storeId: string) {
    if (storeId) {
      params = params.append('store_id', storeId);
    }
    return params;
  }

  public getOrderDetails(
    userId: string,
    storeId: string,
    searchParams: string,
    perPage: number,
    page: number,
    productId: number,
    sortParams?: any,
    isBackorderable?: boolean
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (perPage) {
      params = params.append('per_page', perPage.toString());
      params = params.append('page', page.toString());
    }
    if (searchParams) {
      params = params.append('q[variant_option_values_name_or_variant_sku_cont]', searchParams);
    }
    if (storeId) {
      params = this.appendStoreId(params, storeId);
    }
    if (productId) {
      params = params.append('product_id', productId.toString());
    }
    if (sortParams && sortParams?.order !== SortStatus.None) {
      params = params.append('q[s]', sortParams?.columnName + ' ' + sortParams.order);
    }
    if (isBackorderable) {
      params = params.append('q[backorderable_eq]', isBackorderable.toString());
    }
    return this.http.get<ApiResponse<any>>(this.vendorURL + userId + '/stock_items', {
      params
    });
  }

  public updateStockItem(itemId: number, payload: Stock): Observable<StockResponse> {
    return this.http.patch<any>(environment.apiURL + '/stock_items/' + itemId, payload);
  }

}
