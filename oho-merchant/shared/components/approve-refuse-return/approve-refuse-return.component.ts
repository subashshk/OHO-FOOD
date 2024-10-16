import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { CustomerReturnsService } from 'src/app/services/customer-returns.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-approve-refuse-return',
  templateUrl: './approve-refuse-return.component.html',
  styleUrls: ['./approve-refuse-return.component.scss'],
})
export class ApproveRefuseReturnComponent extends subscribedContainerMixin() implements OnInit {
  @Input() returnItemID: number;
  @Input() refuseModal: boolean = false;
  public remarkForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private returnService: CustomerReturnsService,
    private toastService: ToastService
  ) {
    super();
    this.remarkForm = this.createRemarkForm();
  }

  ngOnInit() { }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  public createRemarkForm(): FormGroup {
    return this.formBuilder.group({
      remark: ['', Validators.required]
    });
  }

  public save(): void {
    if(this.remarkForm.valid) {
      this.onSubmit();
    } else {
      Object.keys(this.remarkForm.controls).forEach((key) => {
        this.remarkForm.controls[key].markAsTouched();
        this.remarkForm.controls[key].markAsDirty();
        this.remarkForm.controls[key].updateValueAndValidity();
      });
    }
  }

  public onSubmit(): void {
    const remark = {
      remark: this.remarkForm.controls.remark.value
    }
    if (this.refuseModal) {
      this.returnService.refuseReturnItem(this.returnItemID, remark).subscribe(
        (res) => {
          if (res?.success) {
            this.modalController.dismiss({ isRefused: true });
          } else {
            this.toastService.presentToast('error', 2000);
          }
        },
        (err) => {
          this.toastService.presentToast(err, 2000);
        }
      )
    } else {
      this.returnService.approveReturnItem(this.returnItemID, remark, 'approved').subscribe(
        (res) => {
          if (res?.success) {
            this.modalController.dismiss({ isApproved: true });
          } else {
            this.toastService.presentToast('error', 2000);
          }
        },
        (err) => {
          this.toastService.presentToast(err, 2000);
        }
      )
    }
  }

  public getModalHeader(): string {
    return this.refuseModal ? 'Confirm Refuse' : 'Confirm Refuse';
  }
}
