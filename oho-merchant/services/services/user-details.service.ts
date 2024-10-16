import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {
  authUrl = environment.apiURL + '/auth/';

  constructor(private http: HttpClient) {}

  facebookLogin(payload: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as 'response',
    };
    return this.http.post<any>(this.authUrl + 'facebook', { auth_response: payload }, httpOptions);
  }

  googleLogin(payload: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as 'response',
    };
    return this.http.post<any>(this.authUrl + 'google', { auth_response: payload }, httpOptions);
  }

  public sendUserOTP(payload: any): Observable<any> {
    return this.http.post<any>(this.authUrl + 'confirmation', payload);
  }

  public resetUserPassword(payload: any): Observable<any> {
    return this.http.put<any>(this.authUrl + 'password', payload);
  }
}
