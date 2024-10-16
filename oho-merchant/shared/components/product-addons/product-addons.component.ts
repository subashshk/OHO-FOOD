import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ProductService } from "src/app/services/product.service";
import { ToastService } from "src/app/services/toast.service";
import { subscribedContainerMixin } from "../../subscribedContainer.mixin";
import { OptionType } from "src/app/models/option-type.model";
import { CustomAlertComponent } from "src/app/ui-shared/components/custom-alert/custom-alert.component";
import { ProductOffersComponent } from "../product-offers/product-offers.component";
import { FormAddOnsComponent } from "../form-add-ons/form-add-ons.component";
import { SelectAddonsComponent } from "../select-addons/select-addons.component";
import { FormChoiceFoodComponent } from "../form-choice-food/form-choice-food.component";
import { finalize } from "rxjs/operators";
import { OptionValues } from "src/app/models/option-values.model";
import { Product } from "src/app/models/product.model";

@Component({
  selector: "app-product-addons",
  templateUrl: "./product-addons.component.html",
  styleUrls: ["./product-addons.component.scss"],
})
export class ProductAddonsComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  @Input() productId: number;
  @Input() fromProductDetail: boolean = false;
  @Input() optionTypes: OptionType[];
  @Input() optionTypeIds: number[];

  public addons: any[] = [];
  public isLoading: boolean = false;
  public totalPageCount: number;
  public pageIndex: number = 1;
  public perPage: number = 10;
  public selectedAddons: OptionType[];
  public selectedArray: number[];

  constructor(
    private modalController: ModalController,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getProductAddons();
    if(this.fromProductDetail) {
      this.selectedAddons = this.optionTypes;
      this.selectedArray = this.optionTypeIds;
    }
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public async openChoiceModal(option: OptionType, optionValue: OptionValues = null): Promise<any> {
    const modal = await this.modalController.create({
      component: FormChoiceFoodComponent,
      cssClass: "alert-modal",
      animated: false,
      componentProps: {
        title: option?.name,
        optionValue,
        optionTypeId: option?.id
      },
    });

    modal.onDidDismiss().then((res) => {
      this.getProductAddons();
    });

    return await modal.present();
  }

  public next(): void {
    const product: any = {
      id: this.productId,
      optionTypeIds: this.selectedArray,
    };
    this.productService.editProduct(product).subscribe(
      (res) => {
        if(res?.success) {
          this.modalController.dismiss();
          if(!this.fromProductDetail) {
            this.showProductOffers();
          }
          this.toastService.presentToast('Product updated successfully', 2000);
        }
      },
      (err) => {
        this.toastService.presentToast('Could not update product details', 2000);
      }
    )
  }

  public async showProductOffers(): Promise<void> {
    const modal = await this.modalController.create({
      component: ProductOffersComponent,
      cssClass: "my-custom-class",
    });
    modal.onDidDismiss().then((res) => {
      if (res?.data) {
        this.modalController.dismiss(true);
      }
    });
    return await modal.present();
  }

  public async selectAddons(): Promise<any> {
    const modal = await this.modalController.create({
      component: SelectAddonsComponent,
      cssClass: "my-custom-class",
      animated: false,
      componentProps: {
        selectedOption: this.selectedAddons
      }
    });

    modal.onDidDismiss().then((res) => {
      if (res?.data) {
        this.selectedArray = res?.data;
        this.getSelectedArray();
      }
    });

    return await modal.present();
  }

  public getSelectedArray(): void {
    if(this.selectedArray) {
      this.selectedAddons = [];
      this.selectedAddons = this.optionTypes.filter(option => this.selectedArray.includes(option?.id));
    }
  }

  public getProductAddons(): void {
    this.isLoading = true;
    const storeId = Number(localStorage.getItem('selectedStoreId'));

    this.productService
      .getOptionTypesByStore(storeId, this.pageIndex, this.perPage)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((res) => {
        if (res?.data) {
          this.optionTypes = res?.data?.data;
          this.getSelectedArray();
        }
      });
  }

  public async deleteConfirmModal(addonId: number): Promise<void> {
    const modal = await this.modalController.create({
      cssClass: "alert-modal",
      component: CustomAlertComponent,
      animated: false,
      componentProps: {
        title: "Confirm Delete",
        text: "Are you sure you want to delete this add-ons? Please, note you cannot undo this action.",
      },
    });

    modal.onDidDismiss().then((res) => {
      if (res?.data?.status === "confirm") {
        // this.deleteProductAddons();
      }
    });

    return await modal.present();
  }

  public async deleteChoiceModal(addonId: number, choiceId: number): Promise<void> {
    const modal = await this.modalController.create({
      cssClass: "alert-modal",
      component: CustomAlertComponent,
      animated: false,
      componentProps: {
        title: "Confirm Delete",
        text: "Are you sure you want to delete this add-ons? Please, note you cannot undo this action.",
      },
    });

    modal.onDidDismiss().then((res) => {
      if (res?.data?.status === "confirm") {
        this.deleteChoiceAddons(addonId, choiceId);
      }
    });

    return await modal.present();
  }

  public deleteChoiceAddons(addonId: number, choiceId: number): void {
    this.productService.deleteOptionValue(addonId, choiceId).
        subscribe((res) => {
          if(res?.success) {
            this.toastService.presentToast('Choice deleted successfully', 2000);
            this.getProductAddons();
          } else {
            this.toastService.presentToast('Cannot delete the choice', 2000);
          }
        })
  }
}
