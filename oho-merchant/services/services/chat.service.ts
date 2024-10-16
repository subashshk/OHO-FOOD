import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DataSnapshot } from '@angular/fire/database/interfaces';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ChatRoom } from '../models/chat-room.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  limitToLast = 6;

  constructor(private db: AngularFireDatabase, private http: HttpClient) {}

  getRoomList(order: string, orderValue: number): Promise<DataSnapshot> {
    return this.db.database.ref('rooms/').orderByChild(order).equalTo(orderValue).once('value');
  }

  off(ref: string): void {
    if (ref) {
      this.db.database.ref(ref).off();
    }
  }

  checkAndCreate(room: ChatRoom): Promise<void> {
    return new Promise((resolve, reject) => {
      this.checkRoom(room)
        .then((res) => {
          resolve();
        })
        .catch((err) => {
          this.createRoom(room)
            .then((res) => {
              resolve();
            })
            .catch((error) => {
              reject();
            });
        });
    });
  }

  checkRoom(room: ChatRoom): Promise<void> {
    const currentRoomRef = 'rooms/' + room.userId.toString() + '-' + room.storeId.toString();
    return new Promise((resolve, reject) => {
      this.db.database
        .ref(currentRoomRef)
        .once('value')
        .then((snap) => {
          if (snap.val()) {
            resolve();
          } else {
            reject();
          }
        });
    });
  }

  async createRoom(room: ChatRoom) {
    const ref = 'rooms/' + room.userId.toString() + '-' + room.storeId.toString();
    try {
      await this.db.database.ref(ref).set(room);
    } catch (error) {}
  }

  sendPush(message: any, userId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.apiURL + '/push/send_push/' + userId, {
      message,
      type: 'user',
    });
  }

  getUnreadCount(key: string, id: number): Promise<any> {
    return this.db.database
      .ref('messages/' + key)
      .orderByChild('seenWithId')
      .equalTo('0-' + id.toString())
      .limitToLast(this.limitToLast)
      .once('value');
  }

  getAllMessageCount(key: string): Promise<any> {
    return this.db.database
      .ref('messages/' + key)
      .once('value');
  }

  updateMessages(chatId: string, id: number): void {
    this.db.database
      .ref('messages/' + chatId)
      .orderByChild('seenWithId')
      .equalTo('0-' + id.toString())
      .once('value', (res) => {
        let updates = {};
        res.forEach((r) => {
          updates['messages/' + chatId + '/' + r.key + '/seenWithId'] = '1';
        });
        this.db.database.ref().update(updates);
      });
  }
}
