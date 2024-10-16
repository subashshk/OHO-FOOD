import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import { AppName } from '../shared/enums/app-name.enum';
import { AppType } from '../shared/enums/app-type.enum';
import { AppVersion } from '../models/app-version.model';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { Verification } from '../models/otp.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  userUrl = environment.apiURL + '/users/';
  authUrl = environment.apiURL + '/auth/';
  versionUrl = environment.apiURL + '/app_versions';

  constructor(private http: HttpClient) { }

  getUserDetails(userId: number) {
    return this.http.get<ApiResponse<User>>(this.userUrl + userId);
  }

  updateUserDetails(payload: any) {
    return this.http.patch<ApiResponse<User>>(this.authUrl, payload);
  }

  updateUserPassword(payload: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  }): Observable<any> {
    return this.http.put<any>(this.authUrl + 'password', payload);
  }

  getAppVersion(name: AppName, app: AppType) {
    let params = new HttpParams();
    params = params.append('q[name_eq]', name);
    params = params.append('q[app_eq]', app);
    return this.http.get<ApiResponse<PaginatedApiResponse<AppVersion>>>(this.versionUrl, {
      params,
    });
  }

  public postOTPMobileNumber(
    mobileNumber: string,
    email: string
  ): Observable<ApiResponse<Verification>> {
    return this.http.post<ApiResponse<Verification>>(
      `${this.authUrl}confirmation`,
      {
        mobileNumber, email
      }
    );
  }

  public getOTP(
    email: string,
    otpCode: string,
    mobileNumber: string
  ): Observable<ApiResponse<Verification>> {
    let params = new HttpParams();
    params = params.append("email", email);
    params = params.append("otp_code", otpCode);
    params = params.append("mobile_number", mobileNumber);
    return this.http.get<ApiResponse<Verification>>(
      `${this.authUrl}confirmation`,
      {
        params,
      }
    );
  }

  public updateProfilePicture(payload: FormData): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<User>>(this.userUrl + 'profile_picture', payload);
  }
}
