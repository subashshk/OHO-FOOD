import { Notification, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "./../../environments/environment";
import { NavController } from "@ionic/angular";
import { Injectable } from "@angular/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { NotificationType } from "../shared/enums/notification-type.enum";
import { GlobalEmitterService } from "./global-emitter.service";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root",
})
export class PushNotificationService {
  private firebaseLoginUrl = environment.apiURL + "/firebase_login/";
  private firebaseLogoutUrl = environment.apiURL + "/firebase_logout/";

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private globalEmitter: GlobalEmitterService,
    private toastService: ToastService
  ) {}

  get pushNotificationToken(): string {
    if (localStorage.getItem("pushNotificationToken")) {
      return localStorage.getItem("pushNotificationToken");
    }
    return "";
  }

  initPushNotifications(): void {
    PushNotifications.requestPermissions().then((res) => {
      if (res.receive) {
        PushNotifications.register();
      } else {
        this.toastService.presentToast(
          "Please allow push notifications permissions for the app.",
          2000,
          "warning"
        );
      }
    });

    PushNotifications.removeAllListeners();

    const addListeners = async () => {
      // registration success
      await PushNotifications.addListener("registration", (token) => {
        localStorage.setItem("pushNotificationToken", token.value);
      });

      // registration failure
      await PushNotifications.addListener("registrationError", (err) => {
        console.error("Registration error: ", err.error);
        this.toastService.presentToast(
          "Notifications may not work correctly.",
          2000,
          "warning"
        );
      });

      // when notification is received when app is open
      await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          const notifications = JSON.parse(notification.data.notification);
          if (
            notifications.notification_type === NotificationType.Chat_message
          ) {
            this.globalEmitter.changeNewMessage.emit(true);
          }
        }
      );

      // when notification is clicked
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          this.redirectUsingNotification(
            JSON.parse(notification.notification.data.notification)
          );
        }
      );
    };

    if (!localStorage.getItem("pushNotificationToken")) {
      this.registerDevice();
    }
  }

  registerDevice(): void {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive) {
        PushNotifications.register();
      } else {
        // Show some error
      }
    });
  }

  redirectUsingNotification(notification: any): void {
    switch (notification.notification_type) {
      case NotificationType.Line_item_status:
      case NotificationType.New_order:
      case NotificationType.Order_Status:
      case NotificationType.Delivery_request_status: {
        this.navigateTo("order-detail/" + notification.details.shipment_number);
        break;
      }
      case NotificationType.Chat_message:
        this.navigateTo("chat-message/" + notification.details.chat_id);
        break;
      default: {
        this.navigateTo("tabs/notification");
      }
    }
  }

  addTokenForUser(): Observable<any> {
    const payload = {
      pushNotificationToken: localStorage.getItem("pushNotificationToken"),
      app: "oho_merchant",
    };
    return this.http.post<any>(this.firebaseLoginUrl, payload);
  }

  removeTokenFromUser(): Observable<any> {
    const payload = {
      pushNotificationToken: localStorage.getItem("pushNotificationToken"),
    };
    return this.http.post<any>(this.firebaseLogoutUrl, payload);
  }

  navigateTo(url: string): void {
    this.navCtrl.navigateForward(url);
  }
}
