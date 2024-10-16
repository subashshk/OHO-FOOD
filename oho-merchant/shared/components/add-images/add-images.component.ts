import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { ToastService } from '../../../services/toast.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { base64ToFile } from 'ngx-image-cropper';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
  GalleryImageOptions,
  GalleryPhoto,
} from '@capacitor/camera';
import { ProductVariantComponent } from '../product-variant/product-variant.component';
import { plainToClass } from 'class-transformer';
import { User } from 'src/app/models/user.model';
import { Product } from 'src/app/models/product.model';
import { ProductAddonsComponent } from '../product-addons/product-addons.component';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-add-images',
  templateUrl: './add-images.component.html',
  styleUrls: ['./add-images.component.scss'],
})
export class AddImagesComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  @Input() productId: number;
  @Input() productName: string;
  @Input() isEdit: boolean;

  public product: Product;
  public options: any;
  public imgURL;
  public fileList = [];
  public isAttemptingToSubmitImage = false;
  public isLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private alertController: AlertController,
    private toastService: ToastService,
    private modalController: ModalController,
    public utility: UtilityService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getProductDetails(this.productId);
  }

  public async getCamera(): Promise<void> {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 50,
    })
    .then((photo) => {
      this.fileList.push(`data:image/jpeg;base64,${photo.base64String}`)
    })
  }

  private async readAsBase64(photo?: GalleryPhoto | Photo): Promise<string> {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  public async getGallery(): Promise<void> {
    const options: GalleryImageOptions = {
      correctOrientation: true,
    };
    Camera.pickImages(options).then(async (res) => {
      const images = res.photos;
      for (let image = 0; image < images.length; image++) {
        const base64Data = await this.readAsBase64(images[image]);
        const file = base64ToFile(base64Data);
        this.fileList.push({
          webPathView: images[image].webPath,
          filePath: file,
        });
      }
    });
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  private uploadImage(file: any[]): void {
    const formData = new FormData();
    const images = [];
    file.forEach((img) => {
      images.push(base64ToFile(img) as any);
    })
    images.forEach((img) => {
      formData.append('images[]', img as any);
      formData.append('viewable_id', this.productId.toString())
    })
    this.isAttemptingToSubmitImage = true;
    this.productService
      .createProductImage(this.productId, formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success) {
            this.fileList = [];
            this.isAttemptingToSubmitImage = false;
            this.toastService.presentToast(
              'Image added successfully.',
              2000,
              'success'
            );
            this.modalController.dismiss({ isDismissed: true});
            if(!this.isEdit) {
              this.utility.isFood() ? this.openProductAddonsModal() : this.openProductVariantModal();
            }
          }
        },
        (err) => {
          alert('Failed' + err);
          this.isAttemptingToSubmitImage = false;
        }
      );
  }

  public goToPropertyTypes(): void {
    if (this.fileList.length > 0) {
      this.uploadImage(this.fileList);
    } else {
      this.imageUploadMessagePopup();
    }
  }

  public removeImage(index: number): void {
    this.fileList.splice(index, 1);
  }

  public async imageUploadMessagePopup(): Promise<any> {
    const alert = await this.alertController.create({
      cssClass: 'apply-alert-icon alert-modal-class',
      message: 'Please upload atleast one image !',
      buttons: [
        {
          text: 'Got It',
          role: 'cancel',
          cssClass: 'alert-no',
        },
      ],
    });
    await alert.present();
  }

  public getProductDetails(productId: number): void {
    this.isLoading = true;
    const currentUser = plainToClass(User, JSON.parse(localStorage.getItem('currentUser')));
    this.productService
      .getProductById(currentUser?.id, productId)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.isLoading = false )
      )
      .subscribe(
        (res) => {
        if (res) {
          this.product = res;
        } else {
          this.toastService.presentToast('Product details could not be fetched', 2000);
        }
      },
      (err) => {
        this.toastService.presentToast(err?.error?.message, 2000);
      });
  }

  public async openProductVariantModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductVariantComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        productId: this.productId,
        productName: this.productName,
        optionTypes: this.product?.optionTypes
      },
    });
    return await modal.present();
  }

  public async openProductAddonsModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductAddonsComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        productId: this.productId,
        productName: this.productName,
        optionTypes: this.product?.optionTypes
      },
    });
    return await modal.present();
  }
}
