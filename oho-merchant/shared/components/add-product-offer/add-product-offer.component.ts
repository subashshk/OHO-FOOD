import { Component, Input, OnInit } from '@angular/core';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { Sales } from 'src/app/models/sales.model';
import { UtilityService } from 'src/app/services/utility.service';
import { ProductService } from 'src/app/services/product.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-product-offer',
  templateUrl: './add-product-offer.component.html',
  styleUrls: ['./add-product-offer.component.scss'],
})
export class AddProductOfferComponent extends subscribedContainerMixin() implements OnInit {
  @Input() productId: number;
  @Input() offer: Sales;

  public productOffersForm: FormGroup;
  public selectedDate: Date = new Date();
  public selectedProperty: Sales = {};
  public isLoading: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    public datePipe: DatePipe,
    private utility: UtilityService,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    super();
    this.productOffersForm = this.createProductOffersForm();
  }

  ngOnInit(): void {
    if(this.offer) {
      this.populateOffer();
    }
  }

  public dismiss(): void {
    this.modalCtrl.dismiss();
  }

  public populateOffer(): void {
    this.productOffersForm.patchValue(this.offer);
  }

  public createProductOffersForm(): FormGroup {
    return this.formBuilder.group({
      value: [''],
      startAt: [''],
      endAt: ['']
    });
  }

  public getDate($event: any, showEndDate: boolean = false): void {
    this.selectedDate = $event.detail.value;
    const formattedDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    if(showEndDate) {
      this.productOffersForm.controls['endAt'].setValue(formattedDate);
    } else {
      this.productOffersForm.controls['startAt'].setValue(formattedDate);
    }
  }

  public saveProductOffer(): void {
    this.isLoading = true;
    this.selectedProperty.value = (Number(this.productOffersForm.controls.value.value) / 100).toString();
    this.selectedProperty.startAt = this.utility.getUTCStartDateString(
      this.productOffersForm.controls.startAt.value
    );
    this.selectedProperty.endAt = this.utility.getUTCEndDateString(this.productOffersForm.controls.endAt.value);
    if(this.offer) {
      this.editProductOffer();
    } else {
      this.productService.createProductOffers(this.productId, this.selectedProperty).subscribe(
        (res) => {
          this.handleResponse(res?.success, 'create');
          this.clearData();
          this.modalCtrl.dismiss({ isDismissed: true})
        },
        (err) => {
          this.clearData();
          this.toastService.presentToast('Failed to create product offer', 2000);
        }
      );
    }
  }

  public editProductOffer(): void {
    this.selectedProperty.id = this.offer?.id;
    this.productService.editProductOffers(this.productId, this.selectedProperty).subscribe(
      (res) => {
        this.handleResponse(res?.success, 'update');
        this.clearData();
        this.modalCtrl.dismiss({ isDismissed: true})
      },
      (err) => {
        this.clearData();
        this.toastService.presentToast('Failed to update product offer', 2000);
      }
    );
  }

  public handleResponse(success: boolean, action:string): void {
    if (success) {
      this.toastService.presentToast(`Product offer ${action}d successfully`, 2000);
    } else {
      this.toastService.presentToast(`Failed to ${action} product offer`, 2000);
    }
  }

  public clearData(): void {
    this.isLoading = false;
    this.selectedProperty = {};
  }
}
