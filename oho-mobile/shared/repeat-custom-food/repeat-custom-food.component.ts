import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderFoodComponent } from '../order-food/order-food.component';
import { Product } from 'src/app/models/product.model';
import { FoodType } from '@globalEnums/food-type.enum';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { ProductService } from 'src/app/services/product.service';
import { ProductOrderService } from 'src/app/services/product-order.service';
import { PlatformServices } from '@globalEnums/services.enum';
import { PlatformService } from 'src/app/services/platform.service';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';

@Component({
  selector: 'app-repeat-custom-food',
  templateUrl: './repeat-custom-food.component.html',
  styleUrls: ['./repeat-custom-food.component.scss'],
})
export class RepeatCustomFoodComponent implements OnInit {

  @Input() product: Product;

  public FoodType = FoodType;
  public form: FormGroup;
  public selectedVariant: any[] = [];
  public currentServiceType: PlatformServices;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private productService: ProductService,
    private productOrderService: ProductOrderService,
    private platformService: PlatformService,
    private globalEmitter: GlobalEmitterService
  ) {}

  ngOnInit(): void {
    this.currentServiceType = this.platformService.getCurrentServiceType();
    const formControls = {};
    for (const variant of this.product?.variants) {
      formControls[variant?.id] = [0];
    }

    this.form = this.formBuilder.group(formControls);
    this.selectedVariant = [];
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public async showOrderModal(event: Event = null): Promise<any> {
    if (event) {
      event.stopPropagation();
    }
    const modal = await this.modalController.create({
      id: 'order-food-modal',
      component: OrderFoodComponent,
      componentProps: {
        isCreate: true,
        product: this.product,
        quantity: 1,
      },
    });
    return await modal.present();
  }

  public apply(): void {
    const formControlNames = Object.keys(this.form.controls);
    this.selectedVariant = formControlNames
      .filter(controlName => {
        const control = this.form.get(controlName);
        return control.value > 0;
      })
      .map(controlName => {
        const control = this.form.get(controlName);
        return {
          variantId: controlName,
          quantity: control?.value
        };
      });

      if(this.selectedVariant?.length) {
        this.createProductOrder();
      } else {
        this.toastService.presentToast('Please add some quantity for the products');
      }
  }

  public createProductOrder(): void {
    const request = {
      product_variants: this.selectedVariant,
      service_type: 'food',
    };
    this.productService.createOrder(request).subscribe(
        (res) => {
          if (res) {
            this.productOrderService.updateCartCount(this.currentServiceType);
            this.globalEmitter.getOrderCount.emit(true);
            this.modalController.dismiss();
          }
        }
      );
  }
}
