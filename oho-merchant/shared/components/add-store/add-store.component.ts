import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { FormsService } from 'src/app/services/forms.service';
import { StoreService } from 'src/app/services/store.service';
import { ToastService } from 'src/app/services/toast.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ImageType } from '../../enums/image-type.enum';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { SegmentList } from 'src/app/models/segment-list.model';
import { MapViewModalComponent } from '../map-view-modal/map-view-modal.component';
import { KeyFormatterService } from 'src/app/services/key-formatter.service';
import { Phase } from '../../enums/phase.enum';

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.scss'],
})
export class AddStoreComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  @Input() step: number;
  @Input() fromDashboard: boolean;
  public isLoading = false;
  public toolBarText = {
    1: 'Add Business Information',
    2: 'Store Information',
  };
  private imageBlobData: any;
  private storeId: number;
  private btnTextObj = {
    1: 'Proceed to Store Information',
    2: 'Create your Store',
  };
  public options: string[];
  public serviceTypes: SegmentList[];
  public locationsForm: FormGroup;
  public isPhaseOne: boolean = false;

  constructor(
    private storeService: StoreService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private utility: UtilityService,
    private toastService: ToastService,
    private formsService: FormsService,
    private modalController: ModalController,
    private fb: FormBuilder,
    private keyFormatterService: KeyFormatterService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getServiceType();
    this.isPhaseOne = localStorage.getItem('phase') === Phase.PhaseOne;
  }

  public get locations(): FormArray {
    return this.storeForm.get('locations') as FormArray;
  }

  public get storeForm(): FormGroup {
    return this.formsService.storeForm as FormGroup;
  }

  public get businessForm(): FormGroup {
    return this.formsService.businessForm as FormGroup;
  }

  public clearFile(imageType: ImageType): void {
    if (imageType === ImageType.Certificate) {
      this.businessForm.get('certificateImage').reset();
    }
    if (imageType === ImageType.Logo) {
      this.storeForm.get('logo').reset();
    }
    if (imageType === ImageType.Cover) {
      this.storeForm.get('cover').reset();
    }
  }

  public selectImage(imgType: ImageType): void {
    this.addImage(CameraSource.Photos, imgType);
  }

  public async addImage(
    source: CameraSource,
    imgType: ImageType
  ): Promise<void> {
    const img = await Camera.getPhoto({
      quality: 60,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source,
    });

    this.imageBlobData = this.utility.b64toBlob(
      img.base64String,
      'image/' + img.format
    );

    if (imgType === ImageType.Certificate) {
      this.businessForm.controls.certificateImage.setValue(
        new File([this.imageBlobData], 'certificate.jpeg', {
          type: 'image/' + img.format,
        })
      );
    }
    if (imgType === ImageType.Logo) {
      this.storeForm.controls.logo.setValue(
        new File([this.imageBlobData], 'logo.jpeg', {
          type: 'image/' + img.format,
        })
      );
    }
    if (imgType === ImageType.Cover && !this.isPhaseOne) {
      this.storeForm.controls.cover.setValue(
        new File([this.imageBlobData], 'cover.jpeg', {
          type: 'image/' + img.format,
        })
      );
    }
  }

  public buildStoreFormData(): FormData {
    const store = new FormData();
    store.append('proprietor_name', this.businessForm.value.proprietorName);
    store.append('company_name', this.businessForm.value.companyName);
    store.append('pan_number', this.businessForm.value.panNumber);
    store.append('mobile_number', this.businessForm.value.mobileNumber);
    store.append('email', this.businessForm.value.email);
    store.append('name', this.storeForm.value.storeName);
    store.append('official_description', this.storeForm.value.officialDescription || '');
    store.append('official_status', this.storeForm.value.isOfficialStore ? 'requested' : '');
    store.append(
      'certificate_image',
      this.businessForm.value.certificateImage,
      'pan' + moment().unix() + '.jpeg'
    );
    store.append('service_type', this.storeForm.value.serviceType);
    store.append(
      'logo',
      this.storeForm.value.logo,
      'logo' + moment().unix() + '.jpeg'
    );
    if (!this.isPhaseOne) {
      store.append(
        'cover',
        this.storeForm.value.cover,
        'cover' + moment().unix() + '.jpeg'
      );
    }
    const data = this.keyFormatterService.convertKeys(this.storeForm.value.locations, 'snake');
    store.append('store_address_attributes', JSON.stringify(data));
    return store;
  }

  public createStore(): void {
    if (this.businessForm.valid) {
      this.isLoading = true;
      const params = this.buildStoreFormData();
      this.storeService
        .createStore(params)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (res) => {
            this.dismiss();
            this.isLoading = false;
            this.storeId = res.data.id;
            localStorage.removeItem('selectedStoreId');
            localStorage.setItem('selectedStoreId', this.storeId.toString());
            this.storeCreatedSuccessModal();
          },
          (err) => {
            this.isLoading = false;
            this.toastService.presentToast(
              'Error while creating store',
              2000,
              'danger'
            );
          }
        );
    }
  }

  public getServiceType(): void  {
    this.serviceTypes = [
      { label: 'RealEstate', value: 'real_estate'},
      { label: 'Mall', value: 'mall'},
      { label: 'Mart', value: 'mart'},
      { label: 'Food', value: 'food'},
      { label: 'Vehicle Rental', value: 'rental'}
    ]
  }

  public async storeCreatedSuccessModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: SuccessModalComponent,
      cssClass: 'product-modal',
      componentProps: {
        titleText: 'Store created successfully!',
        subtitle: 'You have successfully created your online store. Happy selling!',
        btnText: 'Go To Dashboard',
        img: 'assets/images/real-estate-success.svg'
      }
    });
    modal.onDidDismiss().then((res) => {
      this.navCtrl.navigateForward('tabs/dashboard');
      this.dismiss();
    })
    return await modal.present();
  }

  public get buttonText(): string {
    return this.btnTextObj[this.step];
  }

  public get toolbarTitle(): string {
    return this.toolBarText[this.step];
  }

  public btnClick(): void {
    switch (this.step) {
      case 1:
        if (this.businessForm.valid) {
          this.step += 1;
        } else {
          Object.keys(this.businessForm.controls).forEach((key) => {
            this.businessForm.controls[key].updateValueAndValidity();
            this.businessForm.controls[key].markAsTouched();
            this.businessForm.controls[key].markAsDirty();
          });
        }
        break;
      case 2:
        if (this.storeForm.valid) {
          this.createStore();
        } else {
          Object.keys(this.storeForm.controls).forEach((key) => {
            this.storeForm.controls[key].updateValueAndValidity();
            this.storeForm.controls[key].markAsTouched();
            this.storeForm.controls[key].markAsDirty();
          });
        }
        break;
    }
  }

  public get imageType(): any {
    return ImageType;
  }

  public dismiss(): void {
    this.step === 2 ? this.step = 1 : this.modalCtrl.dismiss();
  }

  public navigateTo(url: string): void {
    this.navCtrl.navigateForward(url);
  }

  public markAsDefault(index: any): void {
    for (let i = 0; i < this.locations.length; i++) {
      if (i == index) {
        this.locations.controls[i].patchValue({ default: true });
      } else {
        this.locations.controls[i].patchValue({ default: false });
      }
    }
  }

  public async openMapModal(placeId?: any, index?: number): Promise<void> {
    const modal = await this.modalController.create({
      component: MapViewModalComponent,
      componentProps: {
        selectLocation: true,
        placeId
      }
    })

    modal.onDidDismiss().then((res) => {
      if (res?.data?.location) {
        if (index >= 0 && index !== undefined) {
          const address = res?.data?.location;
          this.locations.controls[index].patchValue({
            id: address?.id,
            addressComponents: address?.address_components,
            geometry: address?.geometry,
            types: address?.types,
            placeId: address?.place_id,
            plusCode: address?.plus_code,
            formattedAddress: address?.formatted_address,
            default: address?.default || false,
            phone: address?.phone,
          })
        } else {
          this.addLocation(res?.data?.location);
        }
      }
    })

    return await modal.present();
  }

  public addLocation(location: any): void {
    this.locations.push(this.createLocationFormGroup(location));
  }

  public edit(address: any, index: number): void {
    this.openMapModal(address?.value?.placeId, index);
  }

  public delete(index: number): void {
    this.locations.removeAt(index);
  }

  private createLocationFormGroup(address: any): FormGroup {
    return this.fb.group({
      id: [address?.id],
      addressComponents: [address?.address_components],
      geometry: [address?.geometry],
      types: [address?.types],
      placeId: [address?.place_id],
      plusCode: [address?.plus_code],
      formattedAddress: [address?.formatted_address],
      default: [address?.default || false],
      phone: [address?.phone],
      lat: [address?.geometry?.location.lat()],
      lng: [address?.geometry?.location.lng()]
    });
  }
}
