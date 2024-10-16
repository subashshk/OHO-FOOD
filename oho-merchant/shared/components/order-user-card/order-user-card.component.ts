import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ChatRoom } from 'src/app/models/chat-room.model';
import { Customer } from 'src/app/models/customer.model';
import { User } from 'src/app/models/user.model';
import { ChatService } from 'src/app/services/chat.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-order-user-card',
  templateUrl: './order-user-card.component.html',
  styleUrls: ['./order-user-card.component.scss'],
})
export class OrderUserCardComponent implements OnInit {
  @Input() user: User = new User();
  @Input() customer;
  @Input() isUser: boolean;
  @Input() status: string;
  @Input() hideMap = false;
  @Input() storeName: string;
  @Input() returnStatus: boolean = false;
  @Input() returnStatusLabel: string;
  public chatRoom: string;

  private storeId: number;
  @Output() mapClick: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public utility: UtilityService,
    private navCtrl: NavController,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.storeId = +localStorage.getItem('selectedStoreId');
    this.setChatRoom();
  }

  getStatus(status: string): string {
    if (status === 'accepted') {
      return 'Processing';
    } else if (status === 'completed') {
      return 'Delivered';
    } else {
      return status;
    }
  }

  getRiderImage(): string {
    if (this.user) {
      return this.utility.getImage(this.user.profilePictureMini);
    }
  }

  getSmsString(): string {
    let sms = 'sms://';
    if (this.isUser) {
      if (this.customer) {
        sms = 'sms://' + this.customer.phone;
      }
    } else {
      if (this.user) {
        sms = 'sms://' + this.user.mobileNumber;
      }
    }
    return sms;
  }

  getPhoneString(): string {
    let tel = 'tel://';
    if (this.isUser) {
      if (this.customer) {
        tel = 'tel://' + this.customer.phone;
      }
    } else {
      if (this.user) {
        tel = 'tel://' + this.user.mobileNumber;
      }
    }
    return tel;
  }

  mapClicked(): void {
    this.mapClick.emit(this.isUser);
  }

  public async sendChatMessage(): Promise<void> {
    const room: ChatRoom = {
      storeId: this.storeId,
      storeName: this.storeName,
      userId: this.isUser ? this.customer.id : this.user.id,
      userName: this.isUser ? this.customer.name : this.user.fullName,
    };
    try {
      await this.chatService.checkAndCreate(room);
      this.navCtrl.navigateForward(
        'chat-message/' + room.userId + '-' + room.storeId
      );
    } catch (error) {}
  }

  private setChatRoom(): void {
    if (this.isUser && this.customer) {
      this.chatRoom = this.storeId + '-' + this.customer.id;
    } else {
      this.chatRoom = this.storeId + '-' + this.user.id;
    }
  }
}
