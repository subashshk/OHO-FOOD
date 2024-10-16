import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { ProductService } from 'src/app/services/product.service';
import { ProductProperties } from 'src/app/models/product-properties.model';
import { PropertyType } from 'src/app/models/property-type.model';
import { plainToClass } from 'class-transformer';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-product-property',
  templateUrl: './add-product-property.component.html',
  styleUrls: ['./add-product-property.component.scss'],
})
export class AddProductPropertyComponent extends subscribedContainerMixin() implements OnInit {
  @Input() productId: number;
  @Input() productProperty: ProductProperties;
  @Input() isEdit: boolean = false;

  public productPropertyForm: FormGroup;
  public conditions: string[];
  public selectedProperty: ProductProperties = {};
  public propertyList: PropertyType[] = [];
  public page: number = 1;
  public perPage: number = 10;
  public totalCount: number;
  public search: string;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private toastService: ToastService
  ) {
    super();
    this.productPropertyForm = this.createProductPropertyForm();
  }

  ngOnInit(): void {
    this.getPropertiesDropdownData();
    this.selectedProperty = new ProductProperties();
  }

  public dismiss(): void {
    this.modalCtrl.dismiss();
  }

  public populatePropertyType(): void {
    const property = this.propertyList.find((property) => {
      return property?.id === this.productProperty?.propertyId
    })
    this.productPropertyForm.patchValue({
      propertyType: property,
      propertyValue: this.productProperty?.value
    })
  }

  public createProductPropertyForm(): FormGroup {
    return this.formBuilder.group({
      propertyType: [[]],
      propertyValue: ['']
    });
  }

  public onSubmit(): void {
    this.selectedProperty.productId = this.productId;
    this.selectedProperty.value = this.productPropertyForm.value.propertyValue
    if(this.isEdit) {
      this.editProductProperty(this.selectedProperty);
    } else {
      this.productService.createProductProperty(this.selectedProperty).subscribe(
        (res) => {
          if (res) {
            this.toastService.presentToast('Product property created', 2000);
            this.modalCtrl.dismiss();
          }
        },
        (err) => {
          this.toastService.presentToast(err, 2000);
        }
      );
    }
  }

  public editProductProperty(selectedProperty: ProductProperties): void {
    selectedProperty.id = this.productProperty?.id;
    this.productService.editProductProperty(selectedProperty).subscribe(
      (res) => {
        if (res) {
          this.toastService.presentToast('Product property updated', 2000);
          this.modalCtrl.dismiss();
        }
      },
      (err) => {
        this.toastService.presentToast('Could not update product property', 2000);
      }
    );
  }

  public setPropertyId(event: any): void {
    this.selectedProperty.propertyName = event.detail?.value?.name;
    this.selectedProperty.propertyId = event.detail?.value?.id;
  }

  public getPropertiesDropdownData(): void {
    this.productService
      .getAllProperties(this.page, this.perPage, this.productId, this.search)
      .subscribe((res) => {
        if (res?.data?.data) {
          this.totalCount = res?.data?.totalCount;
          if (this.page === 1) {
            this.propertyList = [];
          }
          this.propertyList = [...this.propertyList, ...plainToClass(PropertyType, res.data.data)];
          if (this.productProperty) {
            this.populatePropertyType();
          }
        }
      });
  }

}
