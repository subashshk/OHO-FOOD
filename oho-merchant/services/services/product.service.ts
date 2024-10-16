import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { Product } from '../models/product.model';
import { Taxons } from '../models/taxons.model';
import { ProductStatus } from '../shared/enums/product-status.enum';
import { PlatformServices } from '../shared/enums/services.enum';
import { Variants } from '../models/variants.model';
import { SortStatus } from '../shared/enums/sort-status';
import { ProductProperties } from '../models/product-properties.model';
import { plainToClass } from 'class-transformer';
import { PropertyType } from '../models/property-type.model';
import { Image } from '../models/image.model';
import { Sales } from '../models/sales.model';
import { VariantResponse } from '../models/variant-response';
import { OptionType } from '../models/option-type.model';
import { OptionValues } from '../models/option-values.model';
import { QuestionAnswer } from '../models/question-answer.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public vendorURL = environment.apiURL + '/vendors/';
  public productURL = environment.apiURL + '/products/';
  public taxonURL = environment.apiURL + '/taxons';
  public optionTypesURL = environment.apiURL + '/option_types';
  public propertyTypesURL = environment.apiURL + '/properties';

  constructor(private http: HttpClient) {}

  public getAllProducts(
    vendorId: number,
    storeId: string,
    pageNo?: number,
    perPage?: number
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (pageNo) {
      params = params.append('per_page', perPage.toString());
    }
    if (perPage) {
      params = params.append('page', pageNo.toString());
    }
    params = params.append('store_id', storeId);
    return this.http.get<ApiResponse<any>>(
      this.vendorURL + vendorId + '/products',
      {
        params,
      }
    );
  }

  public createProduct(product: Product): Observable<any> {
    return this.http.post<any>(this.productURL, {
      product,
    });
  }

  public editProduct(product: Product): Observable<any> {
    return this.http.put<any>(this.productURL + product.id, {
      product,
    });
  }

  public getCategories(
    serviceType: PlatformServices
  ): Observable<ApiResponse<PaginatedApiResponse<any>>> {
    let params = new HttpParams();
    params = params.append('taxonomy', 'categories');
    params = params.append('service_type', serviceType);

    return this.http.get<ApiResponse<PaginatedApiResponse<any>>>(
      this.taxonURL,
      {
        params,
      }
    );
  }

  public getAllTaxonomies(
    serviceType: PlatformServices
  ): Observable<ApiResponse<PaginatedApiResponse<Taxons>>> {
    let params = new HttpParams();
    params = params.append('taxonomy', 'other');
    params = params.append('q[s]', 'permalink asc');
    if (serviceType && serviceType !== PlatformServices.All) {
      params = params.append('service_type', serviceType);
    }

    return this.http.get<ApiResponse<PaginatedApiResponse<Taxons>>>(
      this.taxonURL,
      {
        params,
      }
    );
  }

  public getTaxonomyByName(serviceType: PlatformServices, name: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    params = params.append('taxonomy', name);
    params = params.append('service_type', serviceType);

    return this.http.get<ApiResponse<any>>(this.taxonURL, { params })
  }

  public createProductImage(productId: number, image: FormData) {
    return this.http.post<any>(this.productURL + productId + '/images', image);
  }

  public createVariants(variant: Variants): Observable<any> {
    return this.http.post<any>(this.productURL + variant?.productId + '/variants/', {
      variant,
    });
  }

  public getProductVariants(
    productId: number,
    page: number,
    perPage: number,
    search: string,
    sortParams?: any
  ): Observable<any> {
    let url = this.productURL + productId + '/variants';
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    if (search) {
      params = params.append('q[sku_or_option_values_name_cont]', search);
    }
    if (sortParams && sortParams?.order !== SortStatus.None) {
      params = params.append('q[s]', sortParams?.type + ' ' + sortParams?.order);
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<Variants>>>(url, { params });
  }

  public createProductProperty(productProperty: ProductProperties): Observable<ProductProperties> {
    return this.http
      .post<ApiResponse<ProductProperties>>(
        this.productURL + productProperty?.productId + '/product_properties/',
        {
          productProperty,
        }
      )
      .pipe(
        map((res) => {
          return plainToClass(ProductProperties, res);
        })
      );
  }

  public deleteProductProperty(propertyId: number, productId: number): Observable<any> {
    return this.http.delete<any>(this.productURL + productId + '/product_properties/' + propertyId);
  }

  public editProductProperty(productProperty: ProductProperties): Observable<ProductProperties> {
    return this.http
      .put<ApiResponse<ProductProperties>>(
        this.productURL + productProperty?.productId + '/product_properties/' + productProperty?.id,
        {
          productProperty,
        }
      )
      .pipe(
        map((res) => {
          return plainToClass(ProductProperties, res);
        })
      );
  }

  public editVariants(variant: Variants): Observable<VariantResponse> {
    return this.http.put<any>(this.productURL + variant?.productId + '/variants/' + variant?.id, {
      variant,
    });
  }

  public getProductProperties(productId: number): Observable<ProductProperties[]> {
    return this.http
      .get<ApiResponse<PaginatedApiResponse<ProductProperties>>>(
        this.productURL + productId + '/product_properties'
      )
      .pipe(
        map((res) => {
          return plainToClass(ProductProperties, res?.data?.data);
        })
      );
  }

  public getAllProperties(
    page: number,
    perPage: number,
    productId?: number,
    search?: string
  ): Observable<ApiResponse<PaginatedApiResponse<PropertyType>>> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    if (search) {
      params = params.append('q[name_cont]', search);
    }
    if (productId) {
      params = params.append('product_id', productId.toString());
    }
    return this.http.get<ApiResponse<PaginatedApiResponse<PropertyType>>>(this.propertyTypesURL, {
      params,
    });
  }

  public getProductById(vendorId: number, productId: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(this.vendorURL + vendorId + '/products/' + productId)
      .pipe(
        map((res) => {
          return plainToClass(Product, res?.data);
        })
      );
  }

  public deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(this.productURL + productId);
  }

  public deleteVariant(variantId: number, productId: number): Observable<any> {
    return this.http.delete<any>(this.productURL + productId + '/variants/' + variantId);
  }

  public getProductImages(productId: number): Observable<any> {
    return this.http.get<ApiResponse<PaginatedApiResponse<Image>>>(
      `${this.productURL}${productId}/all_images`
    );
  }

  public getProductOffers(
    productId: number,
    page: number,
    perPage: number
  ): Observable<ApiResponse<PaginatedApiResponse<Sales>>> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());

    return this.http.get<ApiResponse<PaginatedApiResponse<Sales>>>(
      this.productURL + productId + '/sale_prices/',
      { params }
    );
  }

  public createProductOffers(productId: number, sales: Sales): Observable<any> {
    return this.http
      .post<any>(this.productURL + productId + '/sale_prices/', sales);
  }

  public editProductOffers(productId: number, sales: Sales): Observable<any> {
    return this.http
      .put<any>(this.productURL + productId + '/sale_prices/' + sales?.id, sales);
  }

  public deleteProductOffer(offerId: number, productId: number): Observable<any> {
    return this.http.delete<any>(this.productURL + productId + '/sale_prices/' + offerId);
  }

  public getOptionTypesByStore(
    storeId: number,
    page: number = 1,
    perPage: number = 10
  ): Observable<ApiResponse<PaginatedApiResponse<PropertyType>>> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('store_id', storeId);
    params = params.append('per_page', perPage.toString());

    return this.http.get<ApiResponse<PaginatedApiResponse<Sales>>>(
      this.optionTypesURL,
      { params }
    );
  }

  public createOptionType(
    payload: OptionType
  ): Observable<ApiResponse<OptionType>> {
    return this.http.post<ApiResponse<OptionType>>(
      this.optionTypesURL,
      payload
    );
  }

  public updateOptionType(
    optionTypeId: number,
    payload: OptionType
  ): Observable<ApiResponse<OptionType>> {
    return this.http.patch<ApiResponse<OptionType>>(
      this.optionTypesURL + '/' + optionTypeId,
      payload
    );
  }

  public deleteOptionType(optionTypeId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      this.optionTypesURL + '/' + optionTypeId
    );
  }

  public getOptionValues(
    optionTypeId: number,
    pageNum: number,
    perPage: number
  ): Observable<ApiResponse<PaginatedApiResponse<OptionValues>>> {

    let params = new HttpParams();
    params = params.append('page', pageNum.toString());
    params = params.append('per_page', perPage.toString());

    return this.http.get<ApiResponse<PaginatedApiResponse<OptionValues>>>(
      this.optionTypesURL + '/' + optionTypeId + '/option_values',
      { params }
    );
  }

  public createOptionValue(
    optionTypeId: number,
    payload: OptionValues
  ): Observable<ApiResponse<OptionValues>> {
    return this.http.post<ApiResponse<OptionValues>>(
      this.optionTypesURL + '/' + optionTypeId + '/option_values',
      payload
    );
  }

  public updateOptionValue(
    optionTypeId: number,
    optionValueId: number,
    payload: OptionValues
  ): Observable<ApiResponse<OptionValues>> {
    return this.http.patch<ApiResponse<OptionValues>>(
      this.optionTypesURL +
        '/' +
        optionTypeId +
        '/option_values/' +
        optionValueId,
      payload
    );
  }

  public deleteOptionValue(
    optionTypeId: number,
    optionValueId
  ): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      this.optionTypesURL +
        '/' +
        optionTypeId +
        '/option_values/' +
        optionValueId
    );
  }

  public getQAURL(productId: number): string {
    return this.productURL + productId + '/question_and_answers';
  }

  public askQuestionOrReply(productId: number, request): Observable<QuestionAnswer> {
    return this.http.post<ApiResponse<QuestionAnswer>>(this.getQAURL(productId), request).pipe(
      map((res) => {
        return plainToClass(QuestionAnswer, res?.data);
      })
    );
  }
}
