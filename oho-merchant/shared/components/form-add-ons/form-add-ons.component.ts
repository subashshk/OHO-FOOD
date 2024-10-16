import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { add } from 'lodash';
import { finalize } from 'rxjs/operators';
import { OptionType } from 'src/app/models/option-type.model';
import { ProductService } from 'src/app/services/product.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-form-add-ons',
  templateUrl: './form-add-ons.component.html',
  styleUrls: ['./form-add-ons.component.scss'],
})
export class FormAddOnsComponent implements OnInit {
  @Input() optionType: OptionType;

  public optionTypeForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private productService: ProductService
  ) {
    this.optionTypeForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      presentation: [''],
      storeId: [localStorage.getItem('selectedStoreId'), Validators.required],
      maxNoOfChoice: [''],
      choiceType: ['']
    });
  }

  ngOnInit() {
    if(this.optionType) {
      this.optionTypeForm.patchValue(this.optionType);
    }
  }

  public dismissModal(): void {
    this.modalController.dismiss();
  }

  public confirmClick(): void {
    this.optionTypeForm.controls['presentation'].setValue(
      this.optionTypeForm.value.name
    );
    const request = this.optionTypeForm.value;
    if (this.optionType) {
      this.updateOptionType(request);
    } else {
      this.createOptionType(request);
    }
  }

  createOptionType(request: OptionType): void {
    this.productService
      .createOptionType(request)
      .pipe(
        finalize(() => {
          this.modalController.dismiss({ status: 'success' });
        })
      )
      .subscribe(
        (res) => {
          if (res) {
            this.toastService.presentToast('Addons Created successfully', 2000);
          }
        },
        (err) => {
          this.toastService.presentToast('Error while creating addons', 2000);
        }
      );
  }

  updateOptionType(request: OptionType): void {
    this.productService
      .updateOptionType(this.optionType?.id, request)
      .pipe(
        finalize(() => {
          this.modalController.dismiss({ status: 'success' });
        })
      )
      .subscribe(
        (res) => {
          if (res) {
            this.toastService.presentToast('Addons Updated successfully', 2000);
          }
        },
        (err) => {
          this.toastService.presentToast('Error while updating addons', 2000);
        }
      );
  }

  public generateRange(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index + 1);
  }
}
