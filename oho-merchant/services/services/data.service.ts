import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '../models/store.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  private storeSource$ = new BehaviorSubject<any>('');
  updateStoreSource = this.storeSource$.asObservable();

  private dashboardChangeSource$ = new BehaviorSubject<any>({
    dashboardName: 'mall',
  });
  dashboardChange = this.dashboardChangeSource$.asObservable();

  public changeStore(storeId: string): void {
    this.storeSource$.next(storeId);
  }

  public changeDashboard(dashboardName: string) {
    this.dashboardChangeSource$.next({ dashboardName });
  }
}
