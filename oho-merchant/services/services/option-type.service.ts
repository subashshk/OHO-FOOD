import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { OptionType } from '../models/option-type.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SortStatus } from '../shared/enums/sort-status';

@Injectable({
  providedIn: 'root'
})
export class OptionTypeService {
  private optionTypesURL: string = environment.apiURL + '/option_types';

  constructor(private http: HttpClient) { }

  private setParams(page?: number, perPage?: number, storeId?: number, sortParams?: any, searchParams?: string): HttpParams {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    if (storeId) {
      params = params.append('store_id', storeId.toString());
    }
    if (sortParams && sortParams?.order !== SortStatus.None) {
      params = params.append('q[s]', sortParams?.type + ' ' + sortParams?.order);
    }
    if (searchParams) {
      params = params.append('q[name_or_presentation_cont]', searchParams);
    }
    return params;
  }

  public getOptionTypes(
    pageNum: number,
    perPage: number,
    storeId?: number,
    sortParams?: any,
    searchParams?: string
  ): Observable<ApiResponse<PaginatedApiResponse<OptionType>>> {
    const params = this.setParams(pageNum, perPage, storeId, sortParams, searchParams);
    return this.http.get<ApiResponse<PaginatedApiResponse<OptionType>>>(
      this.optionTypesURL,
      { params }
    );
  }

  public createOptionType(
    payload: OptionType
  ): Observable<ApiResponse<OptionType>> {
    return this.http.post<ApiResponse<OptionType>>(
      this.optionTypesURL,
      payload
    );
  }


}
