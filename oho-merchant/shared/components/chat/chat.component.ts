import { Component, Input, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { NavController } from '@ionic/angular';
import { plainToClass } from 'class-transformer';
import { ChatRoom } from 'src/app/models/chat-room.model';
import { ChatService } from 'src/app/services/chat.service';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import * as _ from 'lodash';
import { UtilityService } from 'src/app/services/utility.service';
import * as moment from 'moment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @Input() storeId: number;

  storeName: string;
  roomList: ChatRoom[] = [];

  isLoading: boolean;
  public dataLength: number;

  constructor(
    private chatService: ChatService,
    private navCtrl: NavController,
    private db: AngularFireDatabase,
    private globalEmitter: GlobalEmitterService,
    public utilityService: UtilityService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.initialize();
  }

  doRefresh(event: any): void {
    this.initialize(event);
  }

  initialize(event = null): void {
    if (this.storeId) {
      this.isLoading = true;
      this.getRoomsByStore();
      if (event) {
        setTimeout(() => {
          event.target.complete();
        }, 2000);
      }
    }
  }

  getRoomsByStore(): void {
    this.chatService.getRoomList('storeId', Number(this.storeId)).then((res) => {
      if (res.val()) {
        this.roomList = [];
        res.forEach((room) => {
          this.dataLength = Object.keys(res.val()).length;
          this.chatService.getUnreadCount(room.key, room.val().storeId).then((snap) => {
            let count = 0;
            if (snap.val()) {
              count = Object.keys(snap.val()).length;
            }
            this.roomList.push({
              id: room.key,
              storeId: room.val().storeId,
              storeName: room.val().storeName,
              userId: room.val().userId,
              userName: room.val().userName,
              lastMessage: room.val().lastMessage,
              count: count > 5 ? '5+' : count.toString(),
              timestamp: room.val().timestamp,
              storeImage: room.val().storeImage,
              userImage: room.val().userImage,
            });
            this.sortRoom();
            this.isLoading = false;
          });
        });
      } else {
        this.isLoading = false;
      }
      this.watchRoomChanges();
    });
  }

  sortRoom(): void {
    if (this.roomList.length > 0) {
      this.roomList.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
    }
  }

  watchRoomChanges(): void {
    if (this.storeId) {
      this.chatService.off('rooms/');
      this.db.database
        .ref('rooms/')
        .orderByChild('storeId')
        .equalTo(Number(this.storeId))
        .on('child_changed', (snap) => {
          if (snap.val()) {
            const room = plainToClass(ChatRoom, snap.val());

            this.chatService.getUnreadCount(snap.key, room.storeId).then((snap) => {
              let count = 0;
              if (snap.val()) {
                count = Object.keys(snap.val()).length;
              }
              room.id = snap.key;
              room.count = count > 5 ? '5+' : count.toString();
              this.moveToFirst(room);
              this.globalEmitter.changeNewMessage.emit(true);
            });
          }
        });
    }
  }

  moveToFirst(room: ChatRoom): void {
    const index = this.roomList.findIndex(
      (i) => i.storeId === room.storeId && i.userId === room.userId
    );
    if (index > -1) {
      const tempArray = _.cloneDeep(this.roomList);
      this.roomList = [];
      tempArray.splice(index, 1);
      tempArray.unshift(room);
      this.roomList = tempArray;
    }
  }

  messageDate(timestamp: number): string {
    const diff = moment().local().diff(moment.unix(timestamp).local(), 'days');
    if (diff === 0) {
      return 'Today';
    } else if (diff === 1) {
      return 'Yesterday';
    } else if (diff < 7) {
      return moment.unix(timestamp).local().format('dddd');
    }
    return moment.unix(timestamp).local().format('DD/MM/YY');
  }

  navigateTo(room: ChatRoom): void {
    room.count = '0';
    this.navCtrl.navigateForward('chat-message/' + room.id);
  }
}
