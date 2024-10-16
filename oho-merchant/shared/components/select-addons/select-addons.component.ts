import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { FormAddOnsComponent } from '../form-add-ons/form-add-ons.component';
import { CustomAlertComponent } from 'src/app/ui-shared/components/custom-alert/custom-alert.component';
import { OptionType } from 'src/app/models/option-type.model';
import { ProductService } from 'src/app/services/product.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-select-addons',
  templateUrl: './select-addons.component.html',
  styleUrls: ['./select-addons.component.scss'],
})
export class SelectAddonsComponent implements OnInit {
  public selectedOptionTypes: OptionType[] = [];
  public optionTypes: OptionType[];
  public isLoading: boolean = false;
  public pageIndex: number = 1;
  public perPage: number = 10;

  @Input() selectedOption: OptionType[];

  constructor(
    private modalController: ModalController,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.getProductAddons();
  }

  public goBack(): void {
    this.modalController.dismiss();
  }

  public async openAddModal(optionType: OptionType = null): Promise<any> {
    const modal = await this.modalController.create({
      component: FormAddOnsComponent,
      cssClass: "alert-modal",
      initialBreakpoint: 1,
      animated: false,
      componentProps: {
        optionType: optionType,
      },
    });

    modal.onDidDismiss().then((res) => {
      if (res?.data?.status === "success") {
        this.getProductAddons();
      }
    });

    return await modal.present();
  }

  public isSelected(option: any): boolean {
    return this.selectedOptionTypes.includes(option);
  }

  public toggleSelection(option: any): void {
    if (this.isSelected(option)) {
      this.selectedOptionTypes = this.selectedOptionTypes.filter(
        (data) => data !== option
      );
    } else {
      this.selectedOptionTypes.push(option);
    }
  }

  public confirmSelection(): void {
    const selectedOptionTypeIds = this.selectedOptionTypes.map(
      (option) => option?.id
    );

    this.modalController.dismiss(selectedOptionTypeIds);
  }

  public getProductAddons(): void {
    this.isLoading = true;
    const storeId = Number(localStorage.getItem("selectedStoreId"));

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
          if (this.selectedOption) {
            const matchedArray = res?.data?.data.filter((obj1) =>
              this.selectedOption.some((obj2) =>
                this.areObjectsEqual(obj1, obj2)
              )
            );
            matchedArray.forEach((matchedOption) => {
              if (!this.isSelected(matchedOption)) {
                this.toggleSelection(matchedOption);
              }
            });
          }
        }
      });
  }

  private areObjectsEqual(obj1: OptionType, obj2: OptionType) {
    return obj1?.id === obj2?.id;
  }
}
