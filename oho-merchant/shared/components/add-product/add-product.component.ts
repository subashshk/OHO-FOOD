import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { plainToClass } from 'class-transformer';
import { finalize, takeUntil } from 'rxjs/operators';
import { Product } from 'src/app/models/product.model';
import { Store } from 'src/app/models/store.model';
import { Taxons } from 'src/app/models/taxons.model';
import { ProductService } from 'src/app/services/product.service';
import { StoreService } from 'src/app/services/store.service';
import { ToastService } from 'src/app/services/toast.service';
import { FoodType } from '../../enums/food-type.enum';
import { ProductStatus } from '../../enums/product-status.enum';
import { PlatformServices } from '../../enums/services.enum';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { AddImagesComponent } from '../add-images/add-images.component';
import { DatePipe } from '@angular/common';
import { SortStatus } from '../../enums/sort-status';
import { OptionType } from 'src/app/models/option-type.model';
import { OptionTypeService } from 'src/app/services/option-type.service';
import { User } from 'src/app/models/user.model';
import { CustomAlertComponent } from 'src/app/ui-shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  @Input() product: Product = new Product();
  @Input() isEdit: boolean = false;

  private categoryTotal: number;
  public stores = [];
  public selectedStore: Store;
  public storeServiceType: PlatformServices;
  public listOfCategories = [];
  public listOfTaxons = [];
  public createdProductId: number;
  public isAttemptingSubmit = false;
  public productStatus: boolean = false;
  public conditions = [
    {
      value: 'brand_new',
      label: 'Brand New',
    },
    {
      value: 'like_new',
      label: 'Like New',
    },
    {
      value: 'slightly_used',
      label: 'Slightly Used',
    },
  ];
  public storeList: Store[];
  public productForm: FormGroup;
  public platformServices = PlatformServices;
  public foodTypes = FoodType;
  public trackInventory = false;
  public selectedDate: Date = new Date();
  public isLoading: boolean = false;
  public pageIndex: number = 1;
  public perPage: number = 10;
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
  public categoriesSelectedList: Taxons[] = [];
  public taxonsSelectedList: Taxons[] = [];
  public optionTypeSelectedList: OptionType[] = [];

  constructor(
    private modalController: ModalController,
    private storeService: StoreService,
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private alertController: AlertController,
    public datePipe: DatePipe,
    private optionTypeService: OptionTypeService
  ) {
    super();
    this.productForm = this.createProductForm();
  }

  ngOnInit() {
    this.getStores();
    this.getSelectedStore();
    this.getOptionTypes();
    if (this.product?.id) {
      this.populateSelectedTaxon();
      this.populateSelectedOptionTypes();
      this.productForm.patchValue(this.product);
      this.productForm.patchValue({
        price: this.product?.originalPrice,
        productStatus: this.product?.status === ProductStatus.Active ? true : false,
      });
      this.getOptionTypes();
    }
  }

  public populateSelectedTaxon(): void {
    const taxons = [];
    const categories = [];
    if (this.product?.classifications?.length) {
      this.product.classifications.forEach((classification) => {
        if (classification.taxon.prettyName.indexOf('Categories') === 0) {
          this.categoriesSelectedList.push(classification?.taxon);
          categories.push(classification.taxon.id);
        } else {
          this.taxonsSelectedList.push(classification.taxon);
          taxons.push(classification.taxon.id);
        }
      });
      this.productForm.patchValue({
        categories,
        taxons
      });
    }
  }

  public populateSelectedOptionTypes(): void {
    if (this.product?.optionTypes?.length) {
      this.optionTypeSelectedList = [];
      const optionTypeIds = [];
      this.product.optionTypes.forEach((element) => {
        this.optionTypeSelectedList.push(element);
        optionTypeIds.push(element.id);
      });
      this.productForm.patchValue({
        optionTypeIds,
      });
    }
  }

  public getSelectedStore(): void {
    const storeId = JSON.parse(localStorage.getItem('selectedStoreId'));
    this.storeService
      .getStore(storeId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.selectedStore = res;
        this.storeServiceType = res.serviceType;
        this.getCategories(this.storeServiceType);
        this.getTaxonomies(this.storeServiceType);
      });
  }

  public dismiss(): void {
    if(this.isEdit) {
      this.modalController.dismiss();
    }
    if (this._checkFormValidity()) {
      this.confirmFormExit();
    } else {
      localStorage.setItem('selectedStoreId', this.selectedStore.id.toString());
      this.modalController.dismiss();
    }
  }

  public getStores(): void {
    this.storeService
      .getStores()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res?.data?.data) {
          this.storeList = plainToClass(Store, res.data.data);
          this.storeList.forEach((element) => {
            this.stores.push({
              id: element.id.toString(),
              name: element.name,
              serviceType: element.serviceType,
              currentUserRole: element.currentUserRole,
            });
          });
        }
      });
  }

  public getCategories(serviceType: PlatformServices): void {
    this.productService
      .getCategories(serviceType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.data.data) {
          this.categoryTotal = res.data.totalCount;
          this.listOfCategories = [...plainToClass(Taxons, res.data.data)];
        }
      });
  }

  public getTaxonomies(serviceType: PlatformServices): void {
    this.productService.getAllTaxonomies(serviceType).subscribe((res) => {
      if (res.data.data) {
        this.listOfTaxons = [...plainToClass(Taxons, res.data.data)];
      }
    });
  }

  private _checkFormValidity(): boolean {
    let sum = 0;
    for (let hero of Object.values(this.productForm.value)) {
      sum += hero?.toString()?.length;
    }
    if (sum > 0) return true;
  }

  public async confirmFormExit(): Promise<void> {
    const modal = await this.modalController.create({
      id: 'logout-modal',
      component: CustomAlertComponent,
      cssClass: 'alert-modal',
      showBackdrop: true,
      animated: false,
      componentProps: {
        title: 'Exit Form ?',
        text: 'Are you sure you want to exit this form? If you do so, all your entered data will be lost'
      },
    });
    modal.onDidDismiss().then((res) => {
      if (res?.data?.status === 'confirm') {
        this.modalController.dismiss();
      }
    });
    return await modal.present();
  }

  public async confirmPopup(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'apply-alert-icon alert-modal-class',
      header: 'Exit Form?',
      message:
        'Are you sure you want to exit from this form? If you do, all your entered data will be lost',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-no',
        },
        {
          text: 'Yes',
          cssClass: 'alert-yes',
          handler: () => {
            this.modalController.dismiss();
          },
        },
      ],
    });
    await alert.present();
  }

  public createProductForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      storeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      categories: [[], Validators.required],
      taxons: [[]],
      optionTypeIds: [[]],
      productType: [''],
      description: ['', Validators.required],
      price: ['', Validators.required],
      costPrice: ['', Validators.required],
      sku: ['', Validators.required],
      trackInventory: false,
      productStatus: false
    });
  }

  public setTrackInventory($event): void {
    this.trackInventory = $event.detail.checked;
  }

  public setProductStatus(event: any): void {
    this.productStatus = event?.detail?.checked;
  }

  public setSelectedStore($event): void {
    const storeId = $event.detail.value;
    this.productForm.controls['categories'].reset();
    localStorage.removeItem('selectedStoreId');
    localStorage.setItem('selectedStoreId', storeId.toString());
    this.getSelectedStore();
  }

  public onSubmit(): void {
    this.isAttemptingSubmit = true;
    const selectedStoreId = JSON.parse(localStorage.getItem('selectedStoreId'));
    if (this.productForm.valid) {
      const product = {
        id: this.product?.id,
        name: this.productForm.value.name,
        description: this.productForm.value.description,
        taxonIds: [
          this.productForm.value.categories,
          this.productForm.value.taxons,
        ],
        price: this.productForm.value.price,
        costPrice: this.productForm.value.costPrice,
        sku: this.productForm.value.sku,
        storeId: this.productForm.value.storeId,
        status: this.productStatus ? ProductStatus.Active : ProductStatus.Inactive,
        trackInventory: this.trackInventory,
        optionTypeIds: this.productForm.value.optionTypeIds,
        productType: this.productForm.value.productType,
        startDate: this.productForm.value.startDate,
        endDate: this.productForm.value.endDate
      };
      if(this.isEdit) {
        this.editProductDetails(product);
      } else {
        this.productService
          .createProduct(plainToClass(Product, product))
          .pipe(takeUntil(this.destroyed$))
          .subscribe(
            (res) => {
              if (res?.success) {
                this.toastService.presentToast(
                  'Product created sucessfully',
                  2000,
                  'success'
                );
                this.isAttemptingSubmit = false;
                this.createdProductId = res?.data?.productId;
                this.modalController.dismiss();
                this.presentAddImageModal();
              }
            },
            (err) => {
              if(err?.error?.message?.sku) {
                this.toastService.presentToast('SKU has already been taken', 2000, 'danger');
              } else {
                this.toastService.presentToast(err?.error?.message, 2000, 'danger');
              }
              this.isAttemptingSubmit = false;
            }
          );
      }
    } else {
      this.isAttemptingSubmit = false;
      this.toastService.presentToast(
        'Please fill up all details',
        1000,
        'danger'
      );
      for (const i in this.productForm.controls) {
        if (this.productForm.controls[i].errors) {
          this.productForm.controls[i].markAsDirty();
          this.productForm.controls[i].updateValueAndValidity();
        }
      }
    }
  }

  public editProductDetails(product): void {
    this.productService.editProduct(product).subscribe(
      (res) => {
        if(res?.success) {
          this.modalController.dismiss();
          this.toastService.presentToast('Product updated successfully', 2000);
        }
      },
      (err) => {
        this.toastService.presentToast('Could not update product details', 2000);
      }
    )
  }

  public getOptionTypes(): void {
    this.isLoading = true;
    const selectedStoreId = JSON.parse(localStorage.getItem('selectedStoreId'));
    this.optionTypeService
      .getOptionTypes(
        this.pageIndex,
        this.perPage,
        selectedStoreId,
        this.sortStatus,
        this.searchParams
      )
      .pipe(
        finalize(() => { this.isLoading = false })
      )
      .subscribe((res) => {
        if (res?.success) {
          this.totalPageCount = res?.data?.totalCount;
          this.optionTypesList = res?.data?.data;
          this.resetsortOptionType();
          this.sortOptionType[this.sortStatus?.type] = this.sortStatus?.order;
        }
      },
      (err) => {
        this.toastService.presentToast('Fetching option types failed', 2000);
      });
  }

  public resetsortOptionType(): void {
    Object.keys(this.sortOptionType).forEach((key) => {
      this.sortOptionType[key] = SortStatus.None;
    });
  }

  public async presentAddImageModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddImagesComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        productId: this.createdProductId,
        productName: this.productForm.value.name,
      },
    });
    return await modal.present();
  }

  public getDate($event: any, showEndDate: boolean = false): void {
    this.selectedDate = $event.detail.value;
    const formattedDate = this.datePipe.transform(this.selectedDate, 'dd/MM/yyyy')
    if(showEndDate) {
      this.productForm.controls['endDate'].setValue(formattedDate);
    } else {
      this.productForm.controls['startDate'].setValue(formattedDate);
    }
  }
}
