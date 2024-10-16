import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { Customer, Reward } from '../models/reward.model';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private loyaltyUrl: string = environment.apiURL + '/loyalty/loyalties';
  private scratchUrl: string = environment.apiURL + '/scratch_card/scratch_cards';
  private offerUrl: string = environment.apiURL + '/offer_zone/combo_offers';

  constructor(
    private http: HttpClient,
  ) { }

  // loyalty api services starts
  public getLoyaltyList(id: number, status: string, page: number, perPage: number): Observable<ApiResponse<PaginatedApiResponse<Reward>>> {
    let params = new HttpParams();
    params = params.append('store_id', id);
    params = params.append('q[status_eq]', status);
    params = params.append('page', page);
    params = params.append('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedApiResponse<Reward>>>(this.loyaltyUrl, {
      params
    });
  }

  public getLoyaltyDetails(id: number): Observable<ApiResponse<Reward>> {
    return this.http.get<ApiResponse<Reward>>(this.loyaltyUrl + `/${id}`)
  }

  public createLoyalty(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.loyaltyUrl, params)
  }

  public updateLoyalty(params: any, id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(this.loyaltyUrl + `/${id}`, params)
  }

  public deleteLoyalty(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.loyaltyUrl + `/${id}`)
  }

  public fetchLoyalCustomer(loyaltyCardId: number, page: number, perPage: number): Observable<ApiResponse<PaginatedApiResponse<Customer>>> {
    let params = new HttpParams();
    params = params.append('page', page);
    params = params.append('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedApiResponse<Customer>>>(this.loyaltyUrl + `/${loyaltyCardId}/loyal_customers`, {
      params
    })
  }

  public getCustomerDetail(customerId: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(environment.apiURL + `/loyalty/loyal_customers/${customerId}`)
  }

  public markAsRewarded(customerId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiURL + `/loyalty/mark_as_rewarded/${customerId}`, {});
  }

  public scanQrForLoyalty(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(environment.apiURL + '/loyalty/scan/' + id);
  }

  public stampUserLoyalty(id: number, params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiURL + '/loyalty/stamp/' + id, params);
  }
  // loyalty api services ends

  // scratch api services starts
  public getScratchCardList(id: number, status: string, page: number, perPage: number): Observable<ApiResponse<PaginatedApiResponse<Reward>>> {
    let params = new HttpParams();
    params = params.append('store_id', id);
    params = params.append('q[status_eq]', status);
    params = params.append('page', page);
    params = params.append('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedApiResponse<Reward>>>(this.scratchUrl, {
      params
    })
  }

  public getScratchCardDetails(id: number): Observable<ApiResponse<Reward>> {
    return this.http.get<ApiResponse<Reward>>(this.scratchUrl + `/${id}`)
  }

  public createScratchCard(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.scratchUrl, params)
  }

  public updateScratchCard(params: any, id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(this.scratchUrl + `/${id}`, params)
  }

  public deleteScratchCard(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.scratchUrl + `/${id}`)
  }

  public fetchCustomerByType(scratchCardId: number, page: number, perPage: number, type?: string): Observable<ApiResponse<PaginatedApiResponse<any>>> {
    let params = new HttpParams();
    params = params.append('page', page);
    params = params.append('per_page', perPage);
    if (type) {
      params = params.append('status', type);
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(this.scratchUrl + `/${scratchCardId}/customers`, {
      params
    })
  }

  public scanQrForScratchCard(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.scratchUrl + `/scan_complete/${id}`);
  }

  public confirmGift(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.scratchUrl + `/confirm_gift/${id}`, {});
  }

  public scanQrForGift(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.scratchUrl + `/scan_gift/${id}`);
  }

  public rewardGift(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.scratchUrl + `/reward_gift/${id}`, {});
  }
  // scratch api service ends

  // offer api service starts
  public getOfferList(id: number, status: string, page: number, perPage: number): Observable<ApiResponse<PaginatedApiResponse<Reward>>> {
    let params = new HttpParams();
    params = params.append('store_id', id);
    params = params.append('q[status_eq]', status);
    params = params.append('page', page);
    params = params.append('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedApiResponse<Reward>>>(this.offerUrl, {
      params
    });
  }

  public getOfferDetails(id: number): Observable<ApiResponse<Reward>> {
    return this.http.get<ApiResponse<Reward>>(this.offerUrl + `/${id}`)
  }

  public createOffer(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.offerUrl, params)
  }

  public updateOffer(params: any, id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(this.offerUrl + `/${id}`, params)
  }

  public deleteOffer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.offerUrl + `/${id}`)
  }

  public fetchOfferZoneCustomer(offerCardId: number, page: number, perPage: number): Observable<ApiResponse<PaginatedApiResponse<Customer>>> {
    let params = new HttpParams();
    params = params.append('page', page);
    params = params.append('per_page', perPage);
    return this.http.get<ApiResponse<PaginatedApiResponse<Customer>>>(this.offerUrl + `/${offerCardId}/customers`, {
      params
    })
  }

  public scanQrForOffer(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.offerUrl + `/scan_complete/${id}`);
  }

  public rewardGiftForOffer(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.offerUrl + `/mark_as_rewarded/${id}`, {});
  }
  // offer api service ends
}
