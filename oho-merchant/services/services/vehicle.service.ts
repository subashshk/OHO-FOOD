import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { VehicleType } from '../models/vehicle-type.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  vehicleType = environment.apiURL + '/vehicle_types/';
  fareCalculate = environment.apiURL + '/calculate_fare';

  constructor(
    private http: HttpClient
  ) { }

  public getVehicleTypes(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<VehicleType>>(this.vehicleType);
  }

  public getVehicleFares(distance): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.fareCalculate, {
      distance
    });
  }
}
