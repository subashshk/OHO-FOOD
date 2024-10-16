import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { AddProductPropertyComponent } from '../add-product-property/add-product-property.component';
import { ProductOffersComponent } from '../product-offers/product-offers.component';
import { ProductService } from 'src/app/services/product.service';
import { ProductProperties } from 'src/app/models/product-properties.model';
import { finalize } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { CustomAlertComponent } from 'src/app/ui-shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-product-properties',
  templateUrl: './product-properties.component.html',
  styleUrls: ['./product-properties.component.scss'],
})
export class ProductPropertiesComponent implements OnInit {
  @Input() productId: number;
  @Input() fromProductDetail: boolean = false;
  @ViewChild('addPropertiesModal') addPropertiesModal: IonModal;

  public addProperty: boolean = false;
  public isLoading: boolean = false;
  public productProperties: ProductProperties[];

  constructor(
    private modalController: ModalController,
    private productService: ProductService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.getProductProperties();
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public async addNewProperty(property: ProductProperties = null): Promise<void> {
    const modal = await this.modalController.create({
      component: AddProductPropertyComponent,
      cssClass: 'product-modal',
      componentProps: {
        productId: this.productId,
        productProperty: property,
        isEdit: property ? true : false
      },
    });
    modal.onDidDismiss().then((res) => {
      this.getProductProperties();
    });
    return await modal.present();
  }

  public async showProductOffers(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductOffersComponent,
      cssClass: 'my-custom-class'
    });
    modal.onDidDismiss().then((res) => {
      if(res?.data) {
        this.modalController.dismiss(true);
      }
    });
    return await modal.present();
  }

  public getProductProperties(): void {
    this.isLoading = true;
    this.productService.getProductProperties(this.productId)
    .pipe(
      finalize(() => { this.isLoading = false })
    )
    .subscribe(
      (res) => {
        if (res) {
          this.productProperties = [];
          this.productProperties = res;
        }
      },
      (err) => {
        this.toastService.presentToast('Could not fetch product properties', 2000);
      }
    );
  }

  public async deleteConfirmModal(property: ProductProperties):  Promise<void> {
    const modal = await this.modalController.create({
      cssClass: 'alert-modal',
      component: CustomAlertComponent,
      animated: false,
      componentProps: {
        title: 'Confirm Delete',
        text: 'Are you sure you want to delete this note? Please, note you cannot undo this action.'
      }
    })

    modal.onDidDismiss().then((res) => {
      if(res?.data?.status === 'confirm') {
        this.deleteProductProperty(property);
      }
    });

    return await modal.present();
  }

  public deleteProductProperty(property: ProductProperties): void {
    this.isLoading = true;
    this.productService.deleteProductProperty(property?.id, this.productId)
    .pipe(
      finalize(() => { this.isLoading = false })
    )
    .subscribe(
      (res) => {
        if(res?.success) {
          this.toastService.presentToast('Product property deleted successfully', 2000);
          this.getProductProperties();
        }
      },
      (err) => {
        this.toastService.presentToast('Could not delete product property', 2000);
      }
    )
  }
}
