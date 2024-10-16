import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product.model';
import { PaginatedApiResponse } from '../models/paginated-api-response.model';
import { Image } from '../models/image.model';
import { SortStatus } from '../shared/enums/sort-status';
import { PropertyType } from '../models/property-type.model';
import { ProductProperties } from '../models/product-properties.model';
import { plainToClass } from 'class-transformer';
import { map } from 'rxjs/operators';
import { QuestionAnswer } from '../models/question-answer.model';

@Injectable({
  providedIn: 'root'
})
export class RealEstateCompanyService {
  private vendorUrl = environment.apiURL + '/vendors/';
  private propertyUrl: string = environment.apiURL + '/products/';
  private userUrl: string = environment.apiURL + '/users/';
  private propertyTypesURL: string = environment.apiURL + '/properties';
  private offersUrl: string = environment.apiURL + '/offers/';

  constructor(private http: HttpClient) { }

  private setParams(
    page?: number,
    perPage?: number,
    storeId?: number,
    sortParams?: any,
    searchParams?: string
  ): HttpParams {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());
    if (storeId) {
      params = params.append('store_id', storeId.toString());
    }
    if (sortParams && sortParams.order !== SortStatus.None) {
      params = params.append('q[s]', sortParams.type + ' ' + sortParams.order);
    }
    if (searchParams) {
      params = params.append('q[name_or_presentation_cont]', searchParams);
    }
    return params;
  }

  public getDashboardData(userId: number, serviceType: any): Observable<any> {
    let params = new HttpParams;
    params = params.append('service_type', serviceType)
    return this.http.get<ApiResponse<any>>(`${this.vendorUrl}${userId}/get_count`, { params });
  }

  public createNewProperty(product: Product): Observable<any> {
    return this.http.post<any>(this.propertyUrl, {
      product,
    });
  }

  public editProduct(product: Product): Observable<any> {
    return this.http.put<any>(this.propertyUrl + product?.id, {
      product,
    });
  }

  public getCompanyProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.userUrl}${userId}/profile`);
  }

  public createProductImage(productId: number, image: FormData): Observable<any> {
    return this.http.post<any>(this.propertyUrl + productId + '/images', image);
  }

  public getProductImages(productId: number): Observable<any> {
    return this.http.get<ApiResponse<PaginatedApiResponse<Image>>>(
      `${this.propertyUrl}${productId}/all_images`
    );
  }

  public getAllProducts(userId: number, storeId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('store_id', storeId);
    return this.http.get<any>(`${this.vendorUrl}${userId}/products`, { params })
  }

  public getClassifiedProductById(
    userId: number,
    storeId: number,
    productId: number
  ): Observable<any> {
    return this.http.get<any>(
      this.vendorUrl + userId + '/products/' + productId,
      {
        params: {
          store_id: storeId,
        },
      }
    );
  }

  public getPropertyTypes(
    pageNum: number,
    perPage: number,
    storeId?: number,
    sortParams?: any
  ): Observable<ApiResponse<PaginatedApiResponse<PropertyType>>> {
    const params = this.setParams(pageNum, perPage, storeId, sortParams);
    return this.http.get<ApiResponse<PaginatedApiResponse<PropertyType>>>(this.propertyTypesURL, {
      params,
    });
  }

  public getProductProperties(productId: number): Observable<ProductProperties[]> {
    return this.http
      .get<ApiResponse<PaginatedApiResponse<ProductProperties>>>(
        this.propertyUrl + productId + '/product_properties'
      )
      .pipe(
        map((res) => {
          return plainToClass(ProductProperties, res?.data?.data);
        })
      );
  }

  public createProperty(payload: PropertyType): Observable<ApiResponse<PropertyType>> {
    return this.http.post<ApiResponse<PropertyType>>(this.propertyTypesURL, payload);
  }

  public updatePropertType(
    propertyTypeId: number,
    payload: PropertyType
  ): Observable<ApiResponse<PropertyType>> {
    return this.http.patch<ApiResponse<PropertyType>>(
      this.propertyTypesURL + '/' + propertyTypeId,
      payload
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

  public createProductProperty(productProperty: ProductProperties): Observable<ProductProperties> {
    return this.http
      .post<ApiResponse<ProductProperties>>(
        this.propertyUrl + productProperty?.productId + '/product_properties/',
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

  public editProductProperty(productProperty: ProductProperties): Observable<ProductProperties> {
    return this.http
      .put<ApiResponse<ProductProperties>>(
        this.propertyUrl + productProperty?.productId + '/product_properties/' + productProperty?.id,
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

  public getProductsById(productId: number):Observable<any>{
    return this.http.get<any>(this.propertyUrl + 'get_by_id/' + productId );
  }

  public getAllOffers(storeId: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('store_id', storeId);
    return this.http.get<any>(this.offersUrl + 'store_product_offers', {
      params
    })
  }

  public getQAURL(productId: number): string {
    return this.propertyUrl + productId + '/question_and_answers';
  }

  public getPaginatedeQuestionAnswerByProductId(
    productId: number,
    pageNum: number,
    perPage: number
  ): Observable<ApiResponse<PaginatedApiResponse<QuestionAnswer>>> {
    return this.http.get<ApiResponse<PaginatedApiResponse<QuestionAnswer>>>(
      this.getQAURL(productId),
      {
        params: {
          per_page: perPage.toString(),
          page: pageNum.toString(),
        },
      }
    );
  }
}
