import { Component } from '@angular/core';

import { ModalController, NavController, Platform } from '@ionic/angular';
import 'reflect-metadata';
import { PushNotificationService } from './services/push-notification.service';
import { AngularTokenService } from 'angular-token';
import { UserRole } from './shared/enums/user-role.enum';
import { User } from './models/user.model';
import { plainToClass } from 'class-transformer';

import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { ToastService } from './services/toast.service';
import { takeUntil } from 'rxjs/operators';
import { subscribedContainerMixin } from './shared/subscribedContainer.mixin';
import { AddStoreComponent } from './shared/components/add-store/add-store.component';
import { Capacitor } from '@capacitor/core';
import { ProfileService } from './services/profile.service';
import { StatusBar } from '@capacitor/status-bar';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent extends subscribedContainerMixin() {
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  constructor(
    private platform: Platform,
    private pushNotificationService: PushNotificationService,
    private tokenService: AngularTokenService,
    private navCtrl: NavController,
    private route: Router,
    private toast: ToastService,
    private modalController: ModalController,
    private profileService: ProfileService,
  ) {
    super();
    this.initializeApp();
  }

  ngAfterViewInit() {
    const routes = ['tabs', 'sign-in', 'sign-up'];
    this.platform.backButton.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      const routeArray = this.route.url.split('/');
      if (routeArray.length >= 1) {
        if (routes.includes(routeArray[1])) {
          if (
            new Date().getTime() - this.lastTimeBackPress <
            this.timePeriodToExit
          ) {
            navigator['app'].exitApp();
          } else {
            this.toast.presentToast('Press again to exit.', 3000, 'dark');
            this.lastTimeBackPress = new Date().getTime();
          }
        }
      }
    });
  }

  initializeApp() {
    localStorage.setItem('phase', environment.phase);
    this.platform.ready().then(() => {
      StatusBar.setBackgroundColor({ color: '#ee001a' });
      this.tokenService.validateToken().subscribe(
        (res) => {
          if (res.data) {
            const user = plainToClass(User, res.data);
            if (user.roles.includes(UserRole.Vendor)) {
              localStorage.setItem('currentUser', JSON.stringify(res.data));
              this.navCtrl.navigateForward('tabs');
            } else {
              this.navCtrl.navigateRoot('tabs');
              this.presentAddStoreModal();
            }
          }
          setTimeout(() => {
            SplashScreen.hide();
          }, 1000);
        },
        (err) => {
          this.navCtrl.navigateForward('sign-in');
          setTimeout(() => {
            SplashScreen.hide();
          }, 1000);
        }
      );
    });
    if (Capacitor.platform !== 'web') {
      this.pushNotificationService.initPushNotifications();
    }
  }

  private async presentAddStoreModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddStoreComponent,
      cssClass: 'alert-controller',
      componentProps: {
        step: 1,
        fromDashboard: false,
      },
      backdropDismiss: false,
    });
    return await modal.present();
  }
}
