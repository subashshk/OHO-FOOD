import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { plainToClass } from 'class-transformer';
import { Notification } from 'src/app/models/notification.model';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { NotificationService } from 'src/app/services/notifications.service';
import { NotificationStatus } from '../../enums/notification-status.enum';
import { NotificationType } from '../../enums/notification-type.enum';
import { RecurrentType } from '../../enums/recurrent-type.enum';
import { UserRole } from '../../enums/user-role.enum';
import * as moment from 'moment';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { takeUntil } from 'rxjs/operators';
import { NotificationGroup } from '../../enums/notification-group.enum';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent extends subscribedContainerMixin() implements OnInit {
  @Input() groupName: string;
  @Output() notificationCount = new EventEmitter();

  newNotificationsCount = 0;
  role = UserRole.Vendor;
  public newNotificationCount = 0;
  public notifications: Notification[] = [];
  public currentPage = 1;
  public totalCount = 0;
  public perPage = 15;
  public isLoading = false;

  public itemReadStatus = 'read';
  public notificationType = NotificationType;
  public recurrentType = RecurrentType;
  public noDataImg: any;
  public noDataTitle: string;
  public noDataSubTitle: string;

  constructor(
    private notificationService: NotificationService,
    private globalEmitter: GlobalEmitterService,
    private navCtrl: NavController
  ) {
    super();
  }

  ngOnInit() {}

  ngOnChanges() {
    this.initialize();
  }

  doRefresh(event): void {
    this.initialize(event);
  }

  initialize(event = null): void {
    this.currentPage = 1;
    this.getNewNotificationCount();
    this.isLoading = true;
    this.getNoDataValues();
    this.populateNotifications(false, event);
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 2000);
    }
  }

  getNewNotificationCount(): void {
    this.notificationService
      .getNewNotificationsCount(this.role, this.groupName)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.newNotificationsCount = res.data.count;
      });
  }

  populateNotifications(addToPrevious = false, event = null): void {
    this.notificationService
      .getNotifications(this.currentPage, this.perPage, this.role, this.groupName)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (!addToPrevious) {
          this.notifications = [];
        }
        this.totalCount = res.data.totalCount;
        res.data.data.forEach((notification) => {
          this.notifications.push(plainToClass(Notification, notification));
        });
        this.isLoading = false;
        if (event) {
          event.target.complete();
          if (this.notifications.length === this.totalCount) {
            event.target.disabled = true;
          }
        }
      });
    this.getNotificationCount();
  }

  getNotificationCount(): void {
    this.notificationService
      .getNewNotificationsCount(this.role)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.newNotificationCount = res.data.count;
      });
  }

  populateMoreNotifications(event: any): void {
    this.currentPage += 1;
    this.populateNotifications(true, event);
  }

  markAsRead(notificationId?: number): void {
    this.notificationService
      .markNotificationAsRead(notificationId, this.role)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.globalEmitter.changeNewNotification.emit(true);
        this.notificationCount.emit();
        this.notifications[this.notifications.findIndex((i) => i.id === notificationId)].status =
          NotificationStatus.Read;
      });
  }

  goToNotification(notification: Notification): void {
    this.markAsRead(notification.id);
    if (
      notification.notificationType !== NotificationType.Customer_Alert &&
      notification.notificationType !== NotificationType.Vendor_Alert &&
      notification.routeUrl
    ) {
      this.navCtrl.navigateForward(notification.routeUrl);
    }
  }

  formattedDate(date: Date): string {
    return moment(date).format('MMM DD');
  }

  get notificationStatus(): any {
    return NotificationStatus;
  }

  public getNoDataValues(): void {
    switch (this.groupName) {
      case NotificationGroup.VENDOR_ORDERS:
        this.noDataImg = 'empty-orders.svg';
        this.noDataTitle = 'No orders!';
        this.noDataSubTitle = 'Order related notifications will be listed here once you receive them.';
        break;
      case NotificationGroup.VENDOR_ALERTS:
        this.noDataImg = 'empty-alerts.svg';
        this.noDataTitle = 'No notifications!';
        this.noDataSubTitle = 'Notifications will be listed here once they are sent to you.';
        break;
      case NotificationGroup.VENDOR_PRODUCTS:
        this.noDataImg = 'empty-products.svg';
        this.noDataTitle = 'No Notifications!';
        this.noDataSubTitle = 'Product related notifications will be listed here once you receive them.';
        break;
      case NotificationGroup.VENDOR_STORES:
        this.noDataImg = 'empty-products.svg';
        this.noDataTitle = 'No Notifications!';
        this.noDataSubTitle = 'Store related notifications will be listed here once you receive them.';
        break;
      case NotificationGroup.VENDOR_ORDER_DELIVERIES:
        this.noDataImg = 'empty-notifications.svg';
        this.noDataTitle = 'No Notifications!';
        this.noDataSubTitle = 'Delivery related notifications will be listed here once you receive them.';
        break;
      case NotificationGroup.VENDOR_OFFERS:
        this.noDataImg = 'empty-notifications.svg';
        this.noDataTitle = 'No Notifications!';
        this.noDataSubTitle = 'Notifications will be listed here once they are sent to you.';
        break;
      default:
        this.noDataImg = 'empty-notifications.svg';
        this.noDataTitle = 'No Notifications!';
        this.noDataSubTitle = 'Notifications will be listed here once they are sent to you.';
        break;
    }
  }
}
