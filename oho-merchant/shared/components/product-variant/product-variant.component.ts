import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddProductVariantComponent } from '../add-product-variant/add-product-variant.component';
import { ProductPropertiesComponent } from '../product-properties/product-properties.component';
import { ProductService } from 'src/app/services/product.service';
import { SortStatus } from '../../enums/sort-status';
import { Variants } from 'src/app/models/variants.model';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { OptionType } from 'src/app/models/option-type.model';
import { CustomAlertComponent } from 'src/app/ui-shared/components/custom-alert/custom-alert.component';
import { Steps } from '../../constants/steps';

@Component({
  selector: 'app-product-variant',
  templateUrl: './product-variant.component.html',
  styleUrls: ['./product-variant.component.scss'],
})
export class ProductVariantComponent extends subscribedContainerMixin() implements OnInit {
  @Input() productId: number;
  @Input() fromProductDetail: boolean = false;
  @Input() optionTypes: OptionType[];

  public isLoading: boolean = false;
  public sortStatus: { type: string; order: SortStatus } = {
    type: '',
    order: SortStatus.None,
  };
  public pageIndex: number = 1;
  public perPage: number = 10;
  public totalPageCount: number;
  public searchParams: string;
  public variants: Variants[] = [];
  public sortVariant: {
    sku: SortStatus;
    price: SortStatus;
    cost_price: SortStatus;
  } = {
    sku: SortStatus.None,
    price: SortStatus.None,
    cost_price: SortStatus.None,
  };
  public allSteps = Steps;

  constructor(
    private modalController: ModalController,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getProductVariants();
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public async addProductVariant(variant: Variants = null): Promise<void> {
    const modal = await this.modalController.create({
      component: AddProductVariantComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        productId: this.productId,
        isEdit: variant ? true: false,
        variant: variant,
        optionTypes: this.optionTypes
      },
    });
    modal.onDidDismiss().then((res) => {
      this.getProductVariants();
    });
    return await modal.present();
  }

  public async showProductProperties(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductPropertiesComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        productId: this.productId
      },
    });
    modal.onDidDismiss().then((res) => {
      if(res?.data) {
        this.modalController.dismiss(true);
      }
    });
    return await modal.present();
  }

  public getProductVariants(): void {
    this.isLoading = true;
    this.productService
      .getProductVariants(
        this.productId,
        this.pageIndex,
        this.perPage,
        this.searchParams,
        this.sortStatus
      ).pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        (res) => {
          if (res) {
            this.variants = res?.data?.data;
          }
          this.totalPageCount = res?.data?.totalCount;
          this.resetsortVariant();
          this.sortVariant[this.sortStatus?.type] = this.sortStatus?.order;
        },
        (err) => {
          this.toastService.presentToast(err, 2000);
        }
      );
  }

  public async deleteConfirmModal(variantId: number):  Promise<void> {
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
        this.deleteProductVariant(variantId);
      }
    });

    return await modal.present();
  }

  public deleteProductVariant(variantId: number): void {
    this.isLoading = true;
    this.productService.deleteVariant(variantId, this.productId)
    .pipe(
      finalize(()=> { this.isLoading = false })
    )
    .subscribe(
      (res) => {
        if(res?.success) {
          this.toastService.presentToast('Variant deleted successfully', 2000);
          this.getProductVariants();
        }
      },
      (err) => {
        this.toastService.presentToast('Could not delete product variant', 2000);
      }
    );
  }

  public resetsortVariant(): void {
    Object.keys(this.sortVariant).forEach((key) => {
      this.sortVariant[key] = SortStatus.None;
    });
  }

}
