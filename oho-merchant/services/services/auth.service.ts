import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  sendVerificationEmail(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl + '/auth/confirmation', {
      email,
      sellerAccount: true,
    });
  }

  createAccount(payload: {
    email: string;
    password: string;
    passwordConfirmation: string;
    mobileNumber: number;
    firstName: string;
    lastName: string;
    sellerAccount: boolean;
  }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl + '/auth', payload);
  }
}
