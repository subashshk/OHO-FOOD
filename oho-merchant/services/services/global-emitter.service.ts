import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalEmitterService {
  storeChanged = new EventEmitter<any>();
  changeNewNotification = new EventEmitter<any>();
  clearNotificationCount = new EventEmitter<any>();
  clearOrderCount = new EventEmitter<any>();
  profileDetailsChanged = new EventEmitter();
  lastMessageChanged = new EventEmitter();
  changeNewMessage = new EventEmitter<any>();
  public profileDetailsUpdated: EventEmitter<any> = new EventEmitter();
  constructor() {}
}
