import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  settingsUrl = environment.apiURL + '/settings/';

  constructor(
    private http: HttpClient
  ) { }

  public getSettings() {
    return this.http.get<ApiResponse<any>>(this.settingsUrl + '/get_last');
  }
}
