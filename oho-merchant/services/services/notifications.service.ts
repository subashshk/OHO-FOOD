import { ApiResponse } from './../models/api-response.model';
import { AngularTokenService } from 'angular-token';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from '../shared/enums/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationURL = environment.apiURL + '/notifications/';
  t;

  constructor(private http: HttpClient, private sessionService: AngularTokenService) {}

  public getNotifications(
    page: number,
    perPage: number,
    role: UserRole,
    group?: string
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    params = params.append('role', role);
    if (group) {
      params = params.append('q[group_name]', group);
    }
    return this.http.get<ApiResponse<any>>(this.notificationURL, {
      params,
    });
  }

  public getNewNotifications(
    page: number,
    perPage: number,
    role: UserRole
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    params = params.append('role', role);
    return this.http.get<ApiResponse<any>>(this.notificationURL + 'new', {
      params,
    });
  }

  public getNewNotificationsCount(role: UserRole, group?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('role', role);
    if (group) {
      params = params.append('q[group_name]', group);
    }
    return this.http.get<ApiResponse<any>>(this.notificationURL + 'count', { params });
  }

  public markNotificationAsRead(
    notificationId?: number,
    role?: UserRole
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('role', role);
    return this.http.put<ApiResponse<any>>(
      this.notificationURL + 'mark_as_read',
      {
        id: notificationId,
      },
      { params }
    );
  }
}
