import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Image } from 'src/app/models/image.model';
import { AddImagesComponent } from '../add-images/add-images.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-all-images',
  templateUrl: './all-images.component.html',
  styleUrls: ['./all-images.component.scss'],
})
export class AllImagesComponent extends subscribedContainerMixin() implements OnInit {
  @Input() productId: number;

  public isLoading: boolean = false;
  public imageSet: Image[];

  constructor(
    private productService: ProductService,
    private modalCtrl: ModalController,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.populateImages();
  }

  public populateImages(): void {
    this.isLoading = true;
    this.productService.getProductImages(this.productId)
    .pipe(
      takeUntil(this.destroyed$),
      finalize(() => this.isLoading = false )
    )
    .subscribe(
      (res) => {
        if (res) {
          this.imageSet = res?.data?.data;
        } else {
          // TODO: implement no data case
        }
      },
      (err) => {
        this.toastService.presentToast(err?.error?.message, 2000);
      }
    );
  }

  public back(): void {
    this.modalCtrl.dismiss();
  }

  public showAddImageModal = async (): Promise<void> => {
    const modal = await this.modalCtrl.create({
      component: AddImagesComponent,
      componentProps: {
        productId: this.productId,
        isEdit: true
      },
    });

    modal.onDidDismiss().then(res  => {
      if(res?.data?.isDismissed) {
        this.populateImages();
      }
    })
    return await modal.present();
  };

}
