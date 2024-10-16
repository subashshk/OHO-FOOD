import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private vendorURL = environment.apiURL + '/vendors/';
  private shipmentsURL = environment.apiURL + '/shipments/';
  private riderURL = environment.apiURL + '/riders/';
  private deliveryURL = environment.apiURL + '/deliveries';
  private rideRequestURL = environment.apiURL + '/ride_requests';

  constructor(private http: HttpClient) {}

  public getOrders(
    userId: string,
    storeId: string,
    perPage: number,
    page: number,
    state?: string,
    storeAddressId?: string,
    startDate?: string,
    endDate?: string,
    searchParams?: string,
    sortParams?: any
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('per_page', perPage.toString());
    params = params.append('page', page.toString());
    params = params.append('store_id', storeId);
    if (storeAddressId) {
      params = params.append('q[store_address_id_eq]', storeAddressId);
    }
    if (searchParams) {
      params = params.append('q[customer_name_or_order_number]', searchParams);
    }
    if (sortParams && sortParams.order !== 'none') {
      params = params.append(
        'q[s]',
        sortParams.columnName + ' ' + sortParams.order
      );
    }
    if (startDate && endDate) {
      params = params.append('q[created_at_gteq]', startDate);
      params = params.append('q[created_at_lteq]', endDate);
    }
    if (state) {
      params = params.append('q[state_eq]', state);
    }
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + userId + '/orders',
      {
        params,
      }
    );
  }

  public getOrderDetails(shipmentNumber: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.shipmentsURL + shipmentNumber);
  }

  public confirmShipment(shipmentNumber: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.shipmentsURL + shipmentNumber + '/ready',
      {}
    );
  }

  public cancelShipment(shipmentNumber: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.shipmentsURL + shipmentNumber + '/cancel',
      {}
    );
  }

  public deliverShipment(shipmentNumber: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      this.shipmentsURL + shipmentNumber + '/ship',
      {}
    );
  }

  public assignRiders(
    shipmentId: number,
    riderIds: number[],
    distance: number
  ): Observable<ApiResponse<any>> {
    const payload = {
      riderIds,
      shipmentId,
      distance,
    };
    return this.http.post<ApiResponse<any>>(this.deliveryURL, payload);
  }

  public getRiders(
    perPage: number,
    page: number,
    filterParams?: string
  ): Observable<ApiResponse<PaginatedApiResponse<User>>> {
    let params = new HttpParams();
    params = params.append('per_page', perPage.toString());
    params = params.append('page', page.toString());
    if (filterParams) {
      params = params.append(
        'q[ride_preferences_ride_preference_eq]',
        filterParams
      );
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<User>>>(
      this.riderURL,
      { params }
    );
  }

  public confirmPayment(shipmentNumber: string) {
    return this.http.put<ApiResponse<any>>(
      this.shipmentsURL + shipmentNumber + '/confirm_payment',
      {}
    );
  }

  public payToRider(rideRequestId: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      this.rideRequestURL + '/' + rideRequestId + '/confirm_payment_to_rider',
      {}
    );
  }

  public rateRider(
    riderId: number,
    rating: number,
    review: string,
    shipmentId: number,
    deliveryId: number
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.riderURL + riderId + '/reviews',
      {
        rating,
        review,
        shipmentId,
        deliveryId,
      }
    );
  }

  public getOrderByStatus(
    userId: string,
    storeId: string
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('store_id', storeId);
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + userId + '/orders',
      {
        params,
      }
    );
  }
}
