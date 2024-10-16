import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { OptionValues } from 'src/app/models/option-values.model';
import { ProductService } from 'src/app/services/product.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-form-choice-food',
  templateUrl: './form-choice-food.component.html',
  styleUrls: ['./form-choice-food.component.scss'],
})
export class FormChoiceFoodComponent implements OnInit {

  @Input() optionValue: OptionValues;
  @Input() optionTypeId: number = 0;
  @Input() title: string;

  public optionValueForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    this.optionValueForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      presentation: [''],
      price: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if(this.optionValue) {
      this.optionValueForm.patchValue(this.optionValue);
    }
  }

  public dismissModal(): void {
    this.modalController.dismiss();
  }

  public confirmClick(): void {
    this.optionValueForm.controls['presentation'].setValue(
      this.optionValueForm.value.name
    );
    const request = this.optionValueForm.value;
    if (this.optionValue) {
      this.updateOptionValue(request);
    } else {
      this.createOptionValue(request);
    }
  }

  private createOptionValue(request: OptionValues): void {
    this.productService
      .createOptionValue(this.optionTypeId, request)
      .pipe(
        finalize(() => {
          this.modalController.dismiss({ status: 'success' });
        })
      )
      .subscribe(
        (res) => {
          if (res) {
            this.toastService.presentToast('Choice Created successfully', 2000);
          }
        },
        (err) => {
          this.toastService.presentToast('Error while creating choice', 2000);
        }
      );
  }

  private updateOptionValue(request: OptionValues): void {
    this.productService
      .updateOptionValue(this.optionTypeId, this.optionValue?.id, request)
      .pipe(
        finalize(() => {
          this.modalController.dismiss({ status: 'success' });
        })
      )
      .subscribe(
        (res) => {
          if (res) {
            this.toastService.presentToast('Choice Updated successfully', 2000);
          }
        },
        (err) => {
          this.toastService.presentToast('Error while updating choice', 2000);
        }
      );
  }
}
