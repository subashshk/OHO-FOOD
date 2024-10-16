import { GlobalEmitterService } from './../../../services/global-emitter.service';
import { DeliveryOption } from './../../../models/delivery-option.model';
import { DeliveryMethodComponent } from './../delivery-method/delivery-method.component';
import { OrderVendor } from './../../../models/order-vendor.model';
import { Order } from './../../../models/order.model';
import { PlatformService } from 'src/app/services/platform.service';
import { OrderFoodComponent } from './../order-food/order-food.component';
import { PlatformServices } from '@globalEnums/services.enum';
import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { ProductOrder } from 'src/app/models/product-order.model';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { concatMap, delay, finalize, last, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { ProductOrderService } from 'src/app/services/product-order.service';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { productAddedToWishlistMsg, productRemovedFromWishlistMsg } from '../../strings/constants';
import { ToastService } from 'src/app/services/toast.service';
import { AlertController, NavController, ModalController } from '@ionic/angular';
import { Observable, from, of } from 'rxjs';
import { NprCurrencyPipe } from '../../pipes/npr-currency.pipe';
import { CustomAlertComponent } from '../custom-alert/custom-alert.component';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-cart-checkout',
  templateUrl: './cart-checkout.component.html',
  styleUrls: ['./cart-checkout.component.scss'],
})
export class CartCheckoutComponent extends subscribedContainerMixin() implements OnInit, OnChanges {
  @Input() order: Order;
  @Input() pageNum: number;
  @Input() totalProducts: number;
  @Input() isDraft = false;
  @Input() fromCart = false;
  @Output() updatedSubTotal = new EventEmitter();
  @Output() updatedDeliveryCharge = new EventEmitter();
  @Output() deleteProductOrder = new EventEmitter();
  @Output() showDeleteButtonEvent = new EventEmitter<boolean>();
  @Input() isLoader: boolean = false;

  public form: FormGroup;

  public isLoading: boolean;
  public totalPageCount: number;
  public pageIndex = 1;
  public updatedQuantity = 0;
  public isDeleteLoad: boolean = false;

  public currentServiceType: PlatformServices;
  platformServices = PlatformServices;

  deliveryOptions: DeliveryOption[] = [];
  deliveryOptionsPage = 1;
  deliveryOptionsPerPage = 10;
  productTypes = {
    VEG: 'veg',
    NONVEG: 'non-veg',
  };
  public selectedStores: boolean[] = [];
  public selectedProducts: boolean[][] = [];
  public showDeleteButton: boolean = false;

  constructor(
    public utility: UtilityService,
    private fb: FormBuilder,
    private productOrderService: ProductOrderService,
    private productService: ProductService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private modalController: ModalController,
    private platformService: PlatformService,
    private nprCurrencyPipe: NprCurrencyPipe,
    private dataService: DataService
  ) {
    super();
    this.form = this.fb.group({
      quantity: new FormArray([]),
    });
  }

  ngOnChanges(): void {
    this.pageIndex = this.pageNum;
    this.totalPageCount = this.totalProducts;
    if (this.order && this.order.stores && this.order.stores.length !== 0) {
      this.isLoading = false;
    }
    this.addQuantityFormControl();
  }

  ngOnInit() {
    this.currentServiceType = this.platformService.getCurrentServiceType();
    this.getDeliveryOptions();
    this.initializeSelectedProducts();
  }

  public getDeliveryOptions() {
    this.productService
      .listDeliveryOptions(
        this.deliveryOptionsPage,
        this.deliveryOptionsPerPage,
        this.currentServiceType
      )
      .subscribe((res) => {
        if (res.success) {
          this.deliveryOptions = res.data.data;
        }
      });
  }

  goToStore(store: OrderVendor) {
    if (this.fromCart) {
      this.navCtrl.navigateForward(['store', store.id]);
      this.modalController.getTop().then((res) => {
        if (res) {
          this.modalController.dismiss();
        }
      });
    }
  }

  addQuantityFormControl() {
    this.quantityForm.clear();
    this.order.stores.forEach((order) => {
      order.products.forEach((key) => {
        this.quantityForm.push(
          this.fb.group({
            quantity: [key.quantity, Validators.required],
          })
        );
      });
    });
    if (this.form) {
      this.quantityForm.controls.forEach((control) => {
        control.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
          const productIndex = this.quantityForm.controls.indexOf(control);
          const newQuantity = this.quantityForm.controls[productIndex].value.quantity;
          if (newQuantity <= 0) {
            this.deleteConfirm(this.findProduct(productIndex), productIndex);
          } else {
            this.updateOrder(this.findProduct(productIndex), newQuantity);
          }
        });
      });
    }
  }

  findProduct(productIndex: number) {
    let index = 0;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.order.stores.length; i++) {
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < this.order.stores[i].products.length; j++) {
        if (index === productIndex) {
          return this.order.stores[i].products[j];
        }
        index++;
      }
    }
  }

  public updateOrder(product, newQuantity: number) {
    this.updatedQuantity = newQuantity - product.quantity;
    product.quantity = newQuantity;
    this.getNewSubTotal(product);
    const request = {
      quantity: newQuantity,
      specialInstructions: product.specialInstructions,
    };
    product.isLoading = true;
    if (this.form.valid && newQuantity !== 0) {
      this.productOrderService
        .updateProductOrder(request, product.orderNumber, product.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (productOrder) => {
            if (productOrder.success) {
              product.isLoading = false;
              this.productOrderService.updateCartCount(this.currentServiceType);
            }
          },
          (err) => {
            product.isLoading = false;
            this.toastService.presentToast(
              'Failed to update order. Please refresh the page.',
              2000,
              'danger'
            );
          }
        );
    } else {
      product.isLoading = false;
    }
  }

  public getProductOrder(orderNumber: string) {
    this.productOrderService
      .getProductsFromOrder(orderNumber, this.pageNum)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res) {
          this.order = new Order();
          this.order = res.data.order;
        }
      });
  }

  public getNewSubTotal(product: Product) {
    const price = Number(product.changedPrice)
      ? Number(product.changedPrice)
      : Number(product.price);
    const subTotal = (this.updatedQuantity * price).toFixed(2);
    this.updatedSubTotal.emit(Number(subTotal));
  }

  toggleAddWishlist(product: Product) {
    if (product.isAddedToWishlist) {
      this.removeProductFromWishlist(product);
    } else {
      this.addProductToWishList(product);
    }
  }

  addProductToWishList(product: Product) {
    this.productService
      .addItemToWishlist(product.variantId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        product.isAddedToWishlist = true;
        this.toastService.presentToast(productAddedToWishlistMsg.message, 2000);
      });
  }

  removeProductFromWishlist(product: Product) {
    this.productService
      .removeItemFromWishlist(product.variantId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        product.isAddedToWishlist = false;
        this.toastService.presentToast(productRemovedFromWishlistMsg.message, 2000);
      });
  }

  async showOrderModal(product: ProductOrder) {
    if (!this.isDraft) {
      return;
    }
    const modal = await this.modalController.create({
      id: 'order-food-modal',
      component: OrderFoodComponent,
      componentProps: {
        product,
        specialInstructionsEdit: true,
        isCartItem: this.fromCart,
      },
    });
    // modal.onDidDismiss().then((res) => {
    //   if (res.data) {
    //     // this.deleteProductOrder.emit(true);
    //   }
    // });
    return await modal.present();
  }

  async deleteConfirm(order: ProductOrder, index?: number) {
    let message = 'Are you sure you want to remove this item?';

    const modal = await this.modalController.create({
      id: 'confirm-modal',
      cssClass: 'alert-modal',
      component: CustomAlertComponent,
      animated: false,
      componentProps: {
        title: 'Remove Item?',
        text: message,
      }
    })

    modal.onDidDismiss().then((res) => {
      if(res?.data?.status === 'confirm') {
        this.deleteOrder(order);
      } else {
        if (index > -1) {
          this.quantityForm.controls[index].setValue({ quantity: 1 });
        }
      }
    });

    return await modal.present();
  }

  public deleteOrder(product: ProductOrder) {
    product.quantity = 0;
    product.isLoading = true;
    this.productOrderService
      .deleteProductsOrder(product.orderNumber, product.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (productOrder) => {
          if (productOrder.success) {
            this.toastService.presentToast('Removed from cart successfully', 2000);
            this.deleteProductOrder.emit(true);
          }
          product.isLoading = false;
        },
        (err) => {
          product.isLoading = false;
        }
      );
  }

  public getDeliveryCharge(deliveryCharge: number) {
    return deliveryCharge ? deliveryCharge : 0;
  }

  get quantityForm() {
    return this.form.controls.quantity as FormArray;
  }

  getFormGroup(vendorIndex: number, productIndex: number) {
    if (vendorIndex > 0) {
      let count = 0;
      for (let i = vendorIndex - 1; i >= 0; i--) {
        count += this.order.stores[i].products.length;
      }
      return this.quantityForm.controls[count + productIndex];
    } else {
      return this.quantityForm.controls[productIndex];
    }
  }

  async openDeliveryMethodModal(store: OrderVendor) {
    if (!this.isDraft) {
      return;
    }
    const modal = await this.modalController.create({
      component: DeliveryMethodComponent,
      cssClass: 'delivery-methods-modal',
      backdropDismiss: false,
      componentProps: {
        selectedDeliveryOption: store.deliveryOption,
        deliveryOptions: this.deliveryOptions,
      },
    });
    modal.onDidDismiss().then((res) => {
      const updatedCharge =
        Number(res.data.selectedDeliveryOption.deliveryCharge) -
        Number(store.deliveryOption.deliveryCharge);
      if (
        res.data &&
        res.data.selectedDeliveryOption &&
        store.deliveryOption.id !== res.data.selectedDeliveryOption.id
      ) {
        store.deliveryOption = res.data.selectedDeliveryOption;
        this.productOrderService
          .updateOrderDelivery(store.products[0].orderNumber, {
            storeId: store.id,
            deliveryOptionId: store.deliveryOption.id,
          })
          .pipe(takeUntil(this.destroyed$))
          .subscribe(
            (response) => {
              if (response.success) {
                this.toastService.presentToast('You have updated the delivery option.', 2000);
                this.updatedDeliveryCharge.emit(updatedCharge);
              }
            },
            (err) => {
              this.toastService.presentToast('Failed to update delivery option.', 2000, 'danger');
            }
          );
      }
    });
    return await modal.present();
  }

  getVendorSubTotal(item: OrderVendor) {
    let subTotal = 0;
    if (!this.fromCart) {
      subTotal = 0 + Number(item.deliveryOption.deliveryCharge);
    }
    item.products.forEach((product) => {
      subTotal += Number(product.price) * Number(product.quantity);
    });
    return subTotal;
  }

  /**
   * checks if current service type is mart and food
   *
   * @returns { Boolean } - true if current service type is from mart and food
   */
  public isMartFood(): boolean {
    return this.currentServiceType === this.platformServices.Mart || this.currentServiceType === this.platformServices.Food;
  }

  public initializeSelectedProducts(): void {
    this.selectedProducts = this.order.stores.map((store) =>
      store.products.map(() => false)
    );
  }

  public toggleStoreSelection(event: any, storeIndex: number): void {
    const selected = event.target.checked;
    this.selectedStores[storeIndex] = selected;

    this.selectedProducts[storeIndex] = this.selectedProducts[storeIndex].map(
      () => selected
    );
  }

  public toggleProductSelection(event: any, storeIndex: number, productIndex: number): void {
    const selected = event.target.checked;
    this.selectedProducts[storeIndex][productIndex] = selected;
    this.updateStoreSelection(storeIndex);

    this.showDeleteButton = this.selectedProducts.some((storeProducts) =>
      storeProducts.some((selected) => selected)
    );
    this.showDeleteButtonEvent.emit(this.showDeleteButton);
  }

  public updateStoreSelection(storeIndex: number): void {
    const allProductsSelected = this.selectedProducts[storeIndex].every(
      (selected) => selected
    );
    const anyProductSelected = this.selectedProducts[storeIndex].some(
      (selected) => selected
    );
    this.selectedStores[storeIndex] = allProductsSelected;

    if (!anyProductSelected) {
      this.selectedStores[storeIndex] = false;
    }
  }

  public getListOfSelectedProducts(): ProductOrder[] {
    const selectedProducts: ProductOrder[] = [];

    for (
      let storeIndex = 0;
      storeIndex < this.order.stores.length;
      storeIndex++
    ) {
      const storeProducts = this.order.stores[storeIndex].products;
      const selectedProductsIndices: number[] = [];

      for (
        let productIndex = storeProducts.length - 1;
        productIndex >= 0;
        productIndex--
      ) {
        if (this.selectedProducts[storeIndex][productIndex]) {
          selectedProductsIndices.push(productIndex);
          selectedProducts.push(storeProducts[productIndex]);
        }
      }
    }

    return selectedProducts;
  }

  public getListOfAllProducts(): ProductOrder[] {
    const allProducts: ProductOrder[] = [];

    for (
      let storeIndex = 0;
      storeIndex < this.order.stores.length;
      storeIndex++
    ) {
      const storeProducts = this.order.stores[storeIndex].products;

      for (
        let productIndex = storeProducts.length - 1;
        productIndex >= 0;
        productIndex--
      ) {
        allProducts.push(storeProducts[productIndex]);
      }
    }

    return allProducts;
  }

  public deleteSelectedProducts(): void {
    const selectedProducts = this.getListOfSelectedProducts();

    this.selectedProducts = this.order.stores.map((store) =>
      store.products.map(() => false)
    );
    this.showDeleteButton = false;
    this.showDeleteButtonEvent.emit(this.showDeleteButton);

    this.showDeleteConfirmation()
    .then((confirmed) => {
      if (confirmed) {
        this.handleSelectedProductDeletion(selectedProducts);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  public async showDeleteConfirmation(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const modal = await this.modalController.create({
        id: 'confirm-modal',
        cssClass: 'alert-modal',
        component: CustomAlertComponent,
        animated: false,
        componentProps: {
          title: 'Remove Product?',
          text: 'Are you sure you want to remove the selected products?',
        }
      });

      modal.onDidDismiss().then((res) => {
        if (res?.data?.status === 'confirm') {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      try {
        await modal.present();
      } catch (error) {
        reject(error);
      }
    });
  }

  public handleSelectedProductDeletion(selectedProducts: ProductOrder[]): void {
    this.isDeleteLoad = true;
    const deletionPromises = selectedProducts.map((product) =>
      this.multipleDeleteOrder(product)
        .pipe(
          finalize(() => {
          })
        )
    );

    of(...deletionPromises)
      .pipe(
        concatMap((deletionPromise) => deletionPromise)
      )
      .subscribe({
        complete: () => {
          this.deleteProductOrder.emit(true);
          this.isDeleteLoad = false;
          this.displayDeletedToast(selectedProducts);
        },
        error: (error) => {
          this.isDeleteLoad = false;
        }
      });
  }

  public multipleDeleteOrder(product: ProductOrder): any {
    product.isLoading = true;
    return this.productOrderService
      .deleteProductsOrder(product.orderNumber, product.id)
      .pipe(
        finalize(() => {
          product.isLoading = false;
        })
      );
  }

  public displayDeletedToast(deletedProducts: ProductOrder[]): void {
    // todo: this code might be needed in future to show deleted products
    const deletedProductNames = deletedProducts
      .map((product) => product.name)
      .join(', ');
    const message = `Removed from cart successfully`;
    this.toastService.presentToast(message, 2000);
  }

  public triggerUnMatchedOrderProducts(): Observable<ProductOrder[]> {
    const listOfSelectedProducts = this.getListOfSelectedProducts();
    const listOfAllProducts = this.getListOfAllProducts();
    const unmatched = this.unselectedProductList(listOfAllProducts, listOfSelectedProducts);

    if (!unmatched?.length) {
      return of(null);
    }

    this.dataService.setUnselectedData(unmatched);
    return of(unmatched);
  }

  public unselectedProductList(arr1: ProductOrder[], arr2: ProductOrder[]): ProductOrder[] {
    return arr1.filter((obj1) => !arr2.some((obj2) => obj1.id === obj2.id));
  }

  public getGrandTotalOfSelectedProducts(): string {
    try {
      const selectedProducts: ProductOrder[] = this.getListOfSelectedProducts();
      const totalPrice = selectedProducts.reduce((total, product) => {
        const productTotal = parseFloat(product.price) * product.quantity;
        return total + productTotal;
      }, 0);
      const totalPriceWithPipe = this.nprCurrencyPipe.transform(totalPrice);

      return totalPriceWithPipe;
    } catch (error) {
      return 'Error occurred';
    }
  }

  public goToRestaurant(store: any): void {
    const previousURL = localStorage.getItem('previousUrl');
    if(this.currentServiceType === this.platformServices.Food) {
      if(previousURL.includes('store')) {
        this.navCtrl.back();
      } else {
        this.navCtrl.navigateRoot('store/' + store?.id);
      }
    }
  }
}
