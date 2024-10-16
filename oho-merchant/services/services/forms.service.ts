import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Phase } from '../shared/enums/phase.enum';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  public storeForm: FormGroup;
  public businessForm: FormGroup;
  public isPhaseOne: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.isPhaseOne = localStorage.getItem('phase') === Phase.PhaseOne;
    this.storeForm = this.createStoreForm();
    this.businessForm = this.createBusinessForm();
  }

  private createStoreForm(): FormGroup {
    return this.formBuilder.group({
      storeName: ['', [Validators.required]],
      serviceType: [this.isPhaseOne ? 'physical' : '', [Validators.required]],
      logo: ['', [Validators.required]],
      cover: ['', this.isPhaseOne ? [] : [Validators.required]],
      locations: this.formBuilder.array([]),
      isOfficialStore: [false],
      officialDescription: ['']
    });
  }

  private createBusinessForm(): FormGroup {
    return this.formBuilder.group({
      proprietorName: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      panNumber: ['', [Validators.required]],
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
      certificateImage: ['', [Validators.required]],
    });
  }
}
