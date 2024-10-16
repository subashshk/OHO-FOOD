import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { OptionTypeService } from 'src/app/services/option-type.service';
import { SortStatus } from '../../enums/sort-status';
import { OptionType } from 'src/app/models/option-type.model';
import { UtilityService } from 'src/app/services/utility.service';
import { Variants } from 'src/app/models/variants.model';
import { ProductService } from 'src/app/services/product.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-product-variant',
  templateUrl: './add-product-variant.component.html',
  styleUrls: ['./add-product-variant.component.scss'],
})
export class AddProductVariantComponent extends subscribedContainerMixin() implements OnInit {
  @Input() productId: number;
  @Input() variant: Variants;
  @Input() isEdit: boolean = false;
  @Input() optionTypes: OptionType[];

  public variantForm: FormGroup;
  public conditions: string[];
  public isAttemptingSubmit: boolean = false;
  public isLoading: boolean = false;
  public pageIndex: number = 1;
  public perPage: number = 10;
  public storeId: any;
  public sortStatus: { type: string; order: SortStatus } = {
    type: '',
    order: SortStatus.None,
  };
  public searchParams: string = '';
  public totalPageCount: number;
  public optionTypesList: OptionType[];
  public sortOptionType: {
    name: SortStatus;
  } = {
      name: SortStatus.None,
    };
  public isSubmitted: boolean = false;
  public selectOptionTypes: number[] = [];

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private optionTypeService: OptionTypeService,
    public utility: UtilityService,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    super();
    this.variantForm = this.createProductForm();
  }

  ngOnInit(): void {
    if (this.optionTypes) {
      this.selectOptionTypes = new Array<number>(this.optionTypes?.length);
    }
    this.storeId = localStorage.getItem('selectedStoreId');
    if (this.variant) {
      this.populateVariantForm();
    }
  }

  public dismiss(): void {
    this.modalCtrl.dismiss();
  }

  public populateVariantForm(): void {
    this.variantForm.patchValue(this.variant);
    this.selectOptionTypes = [];
    this.variant.optionValues.forEach((option, i) => {
      this.selectOptionTypes[i] = option?.id;
    });
  }

  public createProductForm(): FormGroup {
    return this.formBuilder.group({
      sku: ['', Validators.required],
      weight: [''],
      height: [''],
      width: [[]],
      depth: [[]],
      price: [''],
      costPrice: [''],
      trackInventory: true,
      optionValueIds: [[]]
    });
  }

  public resetsortOptionType(): void {
    Object.keys(this.sortOptionType).forEach((key) => {
      this.sortOptionType[key] = SortStatus.None;
    });
  }

  public onSubmit(): void {
    this.utility.trimInput(this.variantForm, ['sku']);
    this.isSubmitted = true;
    if (this.variantForm.valid) {
      const variantModel: Variants = {
        sku: this.variantForm.value.sku,
        price: this.variantForm.value.price,
        costPrice: this.variantForm.value.costPrice,
        weight: this.variantForm.value.weight,
        height: this.variantForm.value.height,
        width: this.variantForm.value.width,
        depth: this.variantForm.value.depth,
        trackInventory: this.variantForm.value.trackInventory,
        productId: this.productId,
        optionValueIds: this.selectOptionTypes
      };
      if (this.isEdit) {
        this.editProductVariant(variantModel);
      } else {
        this.productService.createVariants(variantModel).subscribe(
          (res) => {
            if (res.success) {
              this.toastService.presentToast('Product variant created successfully', 2000);
              this.dismiss();
            }
          },
          (err) => {
            if (err?.error?.message) {
              if (err?.error?.message?.sku) {
                this.toastService.presentToast('Duplicate SKU', 2000);
              } else if (err?.error?.message?.optionValue) {
                this.toastService.presentToast('Multiple variant cannot be created with same option type', 2000);
              } else {
                this.toastService.presentToast('Failed to save', 2000);
              }
            }
          }
        );
      }
      for (const i in this.variantForm.controls) {
        if (this.variantForm.controls[i].errors) {
          this.variantForm.controls[i].markAsDirty();
          this.variantForm.controls[i].updateValueAndValidity();
        }
      }
    }
  }

  public editProductVariant(variantModel): void {
    variantModel.id = this.variant.id;
    this.productService.editVariants(variantModel).subscribe(
      (res) => {
        if (res?.success) {
          this.toastService.presentToast('Variant updated successfully', 2000);
          this.dismiss();
        }
      },
      (err) => {
        this.toastService.presentToast('Could not update product variant', 2000);
      }
    );
  }
}
