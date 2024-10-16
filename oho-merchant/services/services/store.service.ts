import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { Store } from '../models/store.model';
import { ApiResponse } from '../models/api-response.model';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { Member } from '../models/member.model';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  storeUrl = environment.apiURL + '/stores/';
  public vendorUrl: string = environment.apiURL + '/vendors/';
  public invitationsUrl: string = environment.apiURL + '/invitations/new';

  constructor(private http: HttpClient) { }

  public getStores(
    page?: number,
    perPage?: number
  ): Observable<ApiResponse<PaginatedApiResponse<Store>>> {
    let params = new HttpParams();
    if (page && perPage) {
      params = params.append('page', page.toString());
      params = params.append('per_page', perPage.toString());
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<Store>>>(
      environment.apiURL + '/vendor/stores',
      { params }
    );
  }

  public getStore(storeId): Observable<Store> {
    return this.http.get<ApiResponse<Store>>(this.storeUrl + storeId).pipe(
      map((res) => {
        return plainToClass(Store, res?.data);
      })
    );
  }

  public getMembers(
    storeId: number,
    page?: number,
    perPage?: number
  ): Observable<ApiResponse<PaginatedApiResponse<Member>>> {
    const userId = JSON.parse(localStorage.getItem('currentUser')).id;
    let params = new HttpParams();
    params = params.append('store_id', storeId);
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    return this.http.get<ApiResponse<PaginatedApiResponse<Member>>>(
      this.vendorUrl + userId + '/staff',
      { params }
    );
  }

  public sendInvitation(payload: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.invitationsUrl, payload);
  }

  createStore(payload): Observable<ApiResponse<Store>> {
    return this.http.post<ApiResponse<Store>>(this.storeUrl, payload);
  }

  public getStoreAddresses(
    storeId: string,
    page?: number,
    perPage?: number
  ): Observable<ApiResponse<PaginatedApiResponse<Address>>> {
    let params = new HttpParams();
    if (page && perPage) {
      params = params.append('page', page.toString());
      params = params.append('per_page', perPage.toString());
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<Address>>>(
      this.storeUrl + storeId + '/addresses',
      { params }
    );
  }

  getInfo(storeId: string): Observable<ApiResponse<PaginatedApiResponse<Member>>> {
    return this.http.get<ApiResponse<PaginatedApiResponse<Member>>>(
      this.storeUrl + storeId + '/info',
      {}
    );
  }

  public getOutletMembers(storeId: number, outletId: number, page: number, perPage: number): Observable<ApiResponse<PaginatedApiResponse<any>>> {
    let params = new HttpParams();
    params = params.append('outlet_id', outletId);
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      this.storeUrl + storeId + '/staffs', {
      params
    }
    )
  }
}
