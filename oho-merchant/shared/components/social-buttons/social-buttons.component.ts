import { NavController } from '@ionic/angular';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { UserDetailsService } from 'src/app/services/user-details.service';
import { ToastService } from 'src/app/services/toast.service';
// import { Plugins } from '@capacitor/core';
// import { FacebookLoginResponse } from '@rdlabo/capacitor-facebook-login';
import { UserRole } from '../../enums/user-role.enum';
// import '@codetrix-studio/capacitor-google-auth';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { LoginOptions } from '../../enums/login-options';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { takeUntil } from 'rxjs/operators';

// const { FacebookLogin } = Plugins;

@Component({
  selector: 'app-social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss'],
})
export class SocialButtonsComponent extends subscribedContainerMixin() implements OnInit {
  @Input() type: string;
  @Output() loading = new EventEmitter<boolean>(true);

  constructor(
    private userDetailService: UserDetailsService,
    private toastService: ToastService,
    private navCtrl: NavController,
    private pushNotificationService: PushNotificationService
  ) {
    super();
  }

  ngOnInit() {}

  // async facebookLogin(): Promise<void> {
  //   const FACEBOOK_PERMISSIONS = ['email', 'public_profile'];
  //   const result = (await FacebookLogin.login({
  //     permissions: FACEBOOK_PERMISSIONS,
  //   })) as FacebookLoginResponse;

  //   const accessToken = result.accessToken.token;
  //   const userId = result.accessToken.userId;

  //   const response = await fetch(
  //     `https://graph.facebook.com/${userId}?fields=id,birthday,email,first_name,last_name&type=large&access_token=${accessToken}`
  //   );
  //   const user = await response.json();

  //   const authRequest = {
  //     email: user.email,
  //     firstname: user.first_name,
  //     lastname: user.last_name,
  //     dob: user.birthday,
  //     uid: userId,
  //     accessToken,
  //   };

  //   this.userDetailService
  //     .facebookLogin(authRequest)
  //     .pipe(takeUntil(this.destroyed$))
  //     .subscribe(
  //       (res) => {
  //         if (res && res.body.success) {
  //           localStorage.setItem('currentUser', JSON.stringify(res.body.data));
  //           localStorage.setItem('loginOptions', LoginOptions.FB);
  //           this.setHeaders(res.headers);
  //           if (res.body.data.roles.includes(UserRole.Vendor)) {
  //             this.pushNotificationService
  //               .addTokenForUser()
  //               .subscribe(() => {});
  //             this.navCtrl.navigateRoot('tabs');
  //           } else {
  //             this.navCtrl.navigateForward('sign-up', {
  //               queryParams: {
  //                 proceed: true,
  //               },
  //             });
  //           }
  //         } else {
  //           this.toastService.presentToast(res.body.message, 2000, 'danger');
  //         }
  //       },
  //       (err) => {
  //         this.toastService.presentToast('Error logging. Please Try Again.', 2000, 'danger');
  //       }
  //     );
  // }

  // async googleLogin(): Promise<void> {
  //   const googleRes = await Plugins.GoogleAuth.signIn();
  //   const authRequest = {
  //     email: googleRes.email,
  //     firstname: googleRes.givenName,
  //     lastname: googleRes.familyName,
  //     fullname: googleRes.displayName,
  //     uid: googleRes.id,
  //     accessToken: googleRes.authentication.idToken,
  //   };
  //   this.userDetailService
  //     .googleLogin(authRequest)
  //     .pipe(takeUntil(this.destroyed$))
  //     .subscribe(
  //       (res) => {
  //         if (res && res.body.success) {
  //           localStorage.setItem('currentUser', JSON.stringify(res.body.data));
  //           localStorage.setItem('loginOptions', LoginOptions.GOOGLE);
  //           this.setHeaders(res.headers);
  //           this.toastService.presentToast('Successfully logged in', 2000, 'success');
  //           if (res.body.data.roles.includes(UserRole.Vendor)) {
  //             this.pushNotificationService
  //               .addTokenForUser()
  //               .subscribe(() => {});
  //             this.navCtrl.navigateRoot('tabs');
  //           } else {
  //             this.navCtrl.navigateForward('sign-up', {
  //               queryParams: {
  //                 proceed: true,
  //               },
  //             });
  //           }
  //         } else {
  //           Plugins.GoogleAuth.logout();
  //           this.toastService.presentToast(res.body.message, 2000, 'danger');
  //         }
  //       },
  //       (err) => {
  //         this.toastService.presentToast('Error logging. Please Try Again.', 2000, 'danger');
  //       }
  //     );
  // }

  public facebookLogin(): void {
    // TODO:: facebook login implementation login
  }

  public googleLogin(): void {
    // TODO:: facebook login implementation login
  }

  setHeaders(header: HttpHeaders): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('client');
    localStorage.removeItem('expiry');
    localStorage.removeItem('uid');
    localStorage.removeItem('tokenType');
    localStorage.setItem('accessToken', header.get('access-token'));
    localStorage.setItem('client', header.get('client'));
    localStorage.setItem('expiry', header.get('expiry'));
    localStorage.setItem('uid', header.get('uid'));
    localStorage.setItem('tokenType', header.get('token-type'));
  }
}
