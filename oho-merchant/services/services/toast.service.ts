import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(public toastController: ToastController) {}

  async presentToast(message: string, duration: number, color = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      cssClass: 'custom-toast',
      buttons: [{
        text: 'Dismiss',
        role: 'confirm'
      }],
      id: 'dismiss-toast'
    });

    const toastElement = document.querySelector('ion-toast');
    const shadowRoot = toastElement.shadowRoot;
    if (toastElement && shadowRoot) {
      const toastWrapper = shadowRoot.querySelector('.toast-wrapper') as HTMLElement;

      if (toastWrapper) {
        toastWrapper.style.bottom = 'env(safe-area-inset-bottom)';
      }
    }

    await toast.present().then(() => {
      toast.keyboardClose = true;
    });
  }
}
