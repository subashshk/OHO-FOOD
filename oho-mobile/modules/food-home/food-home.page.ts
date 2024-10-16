import { Store } from './../../models/store.model';
import { PlatformServices } from './../../enums/services.enum';
import { StoreSectionType } from './../../enums/store-section-type.enum';
import { StoreSection } from './../../models/store-section.model';
import { Taxons } from './../../models/taxons.model';
import { IonContent, ModalController, NavController } from '@ionic/angular';
import { GlobalEmitterService } from './../../services/global-emitter.service';
import { BannerSectionService } from './../../services/banner-section.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Category } from 'src/app/models/category.model';
import { PlatformService } from 'src/app/services/platform.service';
import { CategoryService } from 'src/app/services/category.service';
import { Taxon } from '@globalEnums/taxon.enum';
import { ProductType } from '@globalEnums/product-type.enum';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { Deal } from 'src/app/models/deal.model';
import { StoreService } from 'src/app/services/store.service';
import { plainToClass } from 'class-transformer';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';
import { finalize, takeUntil } from 'rxjs/operators';
import { CartPage } from '../cart/cart.page';
import { AngularTokenService } from 'angular-token';
import { ProductOrderService } from 'src/app/services/product-order.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Address } from 'src/app/models/address.model';

@Component({
  selector: 'app-food-home',
  templateUrl: './food-home.page.html',
  styleUrls: ['./food-home.page.scss'],
})
export class FoodHomePage extends subscribedContainerMixin() implements OnInit, OnDestroy {
  bannerList = [];
  categoriesBannerList = [];
  public bannerBelowBestSeller: any[] = [];
  public bannerBelowPopular: any[] = [];
  public bannerBelowRecommended: any[] = [];

  categorySlideOpts = {
    slidesPerView: 4,
    spaceBetween: 10,
    freeMode: true,
  };
  headerSlideOpts = {
    speed: 400,
    autoplay: {
      delay: 5000,
    },
  };
  listSlideOpts = {
    slidesPerView: 2.25,
    freeMode: true,
    spaceBetween: 10,
  };

  vegStoresSlideOpts = {
    spaceBetween: 10,
    slidesPerView: 1.5,
    freeMode: true,
  };
  categories: Category[] = [];
  topDealsTitle = 'Best Deals';
  topDealsProducts: Product[] = [];

  featuredTitle = 'Featured Treats';

  topSellingTitle = 'Best Sellers';
  topSellingProducts: Product[] = [];

  newArrivalTitle = 'New From Chefs';

  restaurantList: Store[] = [];
  vegStoreList: Store[] = [];

  offersList: Deal[] = [];
  currentServiceType: PlatformServices;
  isLoading: boolean[] = new Array(Object.keys(ProductType).length / 2);

  isSearchFocused = false;

  categoryProductList: Taxons[] = [];

  newArrivalOffer: Deal;
  featuredOffer: Deal;

  offerProductsCount = 10;

  featuredRestaurants: StoreSection;
  newRestaurants: StoreSection;
  storeSectionsList: StoreSection[] = [];
  storesPerPage = 6;
  storesPageIndex = 1;

  spotlightStore: string;
  officialStores: Store[] = [];
  spotlightProducts: Product[] = [];
  cartCount = 0;

  productCountChangedSubscription: Subscription;

  @ViewChild(IonContent, { read: IonContent, static: false })
  public content: IonContent;
  public backToTop: boolean = false;
  public bannerLoad: boolean = false;
  public popularRestaurant: StoreSection[] = [];
  public recommendedRestaurant: StoreSection[] = [];
  public trendingRestaurant: StoreSection[] = [];
  public recommendedLoader: boolean = false;
  public trendingLoader: boolean = false;
  public popularLoader: boolean = false;
  public featuredLoader: boolean = false;
  public newRestaurantLoader: boolean = false;
  public spotlightLoader: boolean = false;
  public vegStoreLoader: boolean = false;
  public productTypes = ProductType;
  public pickupAddress: Address;
  public pickupAddressSubscription: Subscription;
  public orderCountSubscription: Subscription;

  constructor(
    public utility: UtilityService,
    private platformService: PlatformService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private storeService: StoreService,
    private bannerService: BannerSectionService,
    private navCtrl: NavController,
    private globalEmitterService: GlobalEmitterService,
    private modalController: ModalController,
    private tokenService: AngularTokenService,
    private productOrderService: ProductOrderService,
    private dataService: DataService
  ) {
    super();
  }

  ngOnInit() {
    this.watchCartCountChange();
    this.getPickUpAddress();

    this.orderCountSubscription = this.globalEmitterService.getOrderCount.subscribe((res) => {
      if(res) {
        this.getOrdersCount();
      }
    });
  }

  ionViewWillEnter() {
    if (this.currentServiceType !== this.platformService.getCurrentServiceType()) {
      this.currentServiceType = this.platformService.getCurrentServiceType();
      this.initialize();
    }
    this.isSearchFocused = false;
  }

  watchCartCountChange = (): void => {
    this.globalEmitterService.productCountChanged.subscribe((res) => {
      if (res && res.data && res.data.productsCount) {
        this.cartCount = res.data.productsCount;
      } else {
        this.cartCount = 0;
      }
    });
  };

  ngOnDestroy() {
    if (this.productCountChangedSubscription) {
      this.productCountChangedSubscription.unsubscribe();
    }
    if (this.pickupAddressSubscription) {
      this.pickupAddressSubscription.unsubscribe();
    }
  }

  public openCartModal = async (): Promise<void> => {
    const modal = await this.modalController.create({
      component: CartPage,
      componentProps: {
        isModalComponent: true,
      },
    });
    return await modal.present();
  };

  public navigateToStores(): void {
    this.navCtrl.navigateForward('cart-restaurant-list');
  }

  public getOrdersCount = (): void => {
    this.tokenService
      .validateToken()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((stat) => {
        this.productOrderService
          .getFoodOrderList(this.currentServiceType)
          .pipe(takeUntil(this.destroyed$))
          .subscribe((res) => {
            if (res) {
              this.cartCount = res?.data?.count;
            }
          });
      });
  };

  get productType() {
    return ProductType;
  }

  get storeSectionType() {
    return StoreSectionType;
  }

  get platformServices(): any {
    return PlatformServices;
  }

  initialize(event = null) {
    this.topDealsProducts = [];
    this.topSellingProducts = [];
    this.categories = [];
    this.recommendedLoader=true;
    this.trendingLoader=true;
    this.popularLoader=true;
    this.featuredLoader=true;
    this.newRestaurantLoader=true;
    this.spotlightLoader=true;
    this.vegStoreLoader=true;
    this.getBanners();
    this.getOrdersCount();
    this.getPopularRestaurant();
    this.getTrendingRestaurant();
    this.getRecommendedRestaurant();
    this.getCategories();
    this.setNextDealProducts();
    this.getSpotlightStore();
    this.getCategoryProducts();
    this.getStoreSections();
    this.getRestaurantsList(true);

    // TODO: find a way to cpmplete the event without timeout
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 2000);
    }
  }

  doRefresh(event) {
    this.initialize(event);
  }

  setIsSearchFocused(isFocused: boolean) {
    this.isSearchFocused = isFocused;
  }

  getBanners() {
    this.bannerLoad = true;
    this.bannerService
      .getGroupedBanners('home', PlatformServices.Food)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.bannerLoad = false;

          if (res.success) {
            // tslint:disable-next-line: no-string-literal
            this.bannerList = res.data.data['foodHomeSlider'];
            this.categoriesBannerList =
              res.data.data[this.currentServiceType + 'HomePageBannerBelowCategoriesMobile'];

            this.bannerBelowBestSeller =
              res?.data?.data['foodHomeBelowBestSeller'];

            this.bannerBelowPopular =
              res?.data?.data['foodHomeBelowPopular'];

            this.bannerBelowRecommended =
              res?.data?.data['foodHomeBelowRecommended'];
          }
        },
        () => {
          this.bannerLoad = true;
        }
      );
  }

  getCategoryProducts() {
    this.productService
      .getCategoryProducts(10, this.currentServiceType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res) {
            this.categoryProductList = [];
            res.forEach((category) => {
              this.categoryProductList.push(plainToClass(Taxons, category));
            });
          }
        }
      );
  }

  goToTaxon(category: Category) {
    this.navCtrl.navigateForward('search-results', {
      queryParams: {
        category: category.name,
        taxons: category.id,
      },
    });
  }

  getCategories() {
    this.categoryService
      .getCategoryTree(Taxon.Categories, this.currentServiceType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.categories = [];
          res.data.data.forEach((category) => {
            this.categories.push(plainToClass(Category, category));
          });
        }
      );
  }

  setNextDealProducts(productType?: ProductType) {
    this.getProductOffers();

    // code commented for phase 1
    // this.getProductsByType(ProductType.BestSelling);
    // this.getProductsByType(ProductType.TopDeals);
  }

  public getProductsByType(productType) {
    this.isLoading[productType] = true;
    this.productService
      .getProductsByType(productType, this.currentServiceType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (products) => {
          if (products) {
            if (productType === ProductType.TopDeals) {
              products.forEach((product) => {
                this.topDealsProducts.push(plainToClass(Product, product));
              });
            }
            if (productType === ProductType.BestSelling) {
              products.forEach((product) => {
                this.topSellingProducts.push(plainToClass(Product, product));
              });
            }
          }
          this.isLoading[productType] = false;
        },
        () => {
          this.isLoading[productType] = false;
        }
      );
  }

  getRestaurantsList(veg = false) {
    this.vegStoreLoader = true;
    this.storeService
      .getStores(1, 6, this.currentServiceType, '', null, veg)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.vegStoreLoader = false )
      )
      .subscribe(
        (res) => {
          if (res.success) {
            if (veg) {
              this.getRestaurantsList();
              this.vegStoreList = this.getStoresAsClass(res.data.data);
            } else {
              this.restaurantList = this.getStoresAsClass(res.data.data);
            }
          }
        },
        () => {
          if (veg) {
          } else {
            this.getRestaurantsList();
          }
        }
      );
  }

  public getProductOffers() {
    this.featuredLoader = true;
    this.offersList = [];
    this.productService
      .getProductOffers(this.currentServiceType, this.offerProductsCount)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.featuredLoader = false )
      )
      .subscribe(
        (res) => {
          if (res.success) {
            res.data.data.forEach((offer) => {
              this.offersList.push(plainToClass(Deal, offer));
            });
            this.newArrivalOffer = this.offersList.find((offer) => {
              return offer.name === 'New Arrivals' && offer.products.length > 0;
            });

            this.featuredOffer = this.offersList.find((offer) => {
              return offer.name === 'Featured' && offer.products.length > 0;
            });
          }
        }
      );
  }

  public getStoreSections() {
    this.newRestaurantLoader = true;
    this.storeService
      .getStoresWithStoreSections(PlatformServices.Food, this.storesPerPage)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.newRestaurantLoader = false)
      )
      .subscribe(
        (res) => {
          if (res.success) {
            this.storeSectionsList = res.data.data;
            this.newRestaurants = this.storeSectionsList.find((section) => {
              return section.name === StoreSectionType.NewRestaurants && section.stores.length > 0;
            });

            this.featuredRestaurants = this.storeSectionsList.find((section) => {
              return (
                section.name === StoreSectionType.FeaturedRestaurants && section.stores.length > 0
              );
            });

            this.newRestaurants.stores = this.getStoresAsClass(this.newRestaurants.stores);
            this.featuredRestaurants.stores = this.getStoresAsClass(
              this.featuredRestaurants.stores
            );
          }
        }
      );
  }

  getStoresAsClass(stores: Store[]) {
    const resStores = [];
    stores.forEach((store) => {
      resStores.push(plainToClass(Store, store));
    });
    return resStores;
  }

  navigateToStore(storeId: number) {
    this.navCtrl.navigateForward('store/' + storeId);
  }

  goToCategory(category: Category) {
    this.navCtrl.navigateForward('search-results', {
      queryParams: { category: category.name, taxons: category.id },
    });
  }

  shopMore(type: ProductType, deal?: string) {
    let queryParams: any;
    if (deal) {
      queryParams = {
        deal,
      };
    } else {
      queryParams = {
        type,
      };
    }
    this.navCtrl.navigateForward('search-results', {
      queryParams,
    });
  }

  navigateToRestaurants(veg = false, sectionType?: StoreSectionType) {
    let queryParams = {
      veg,
      sectionType: '',
    };
    if (sectionType) {
      queryParams.sectionType = sectionType;
    }
    this.navCtrl.navigateForward('restaurants', { queryParams: queryParams });
  }

  public getSpotlightStore() {
    this.spotlightLoader = true;
    this.spotlightProducts = [];
    this.productService
      .getSpotlightProducts(this.currentServiceType)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.spotlightLoader = false )
      )
      .subscribe(
        (res) => {
          if (res.success) {
            this.spotlightStore = res.data.name;
            res.data.data.forEach((product) => {
              this.spotlightProducts.push(plainToClass(Product, product));
            });
          }
        }
      );
  }

  public getScrollPosition(pos: number): void {
    this.backToTop = pos > 120;
  }

  public getPopularRestaurant(): void {
    this.popularLoader = true;
    this.storeService
      .getStoreByType('most_popular', PlatformServices.Food)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(()=> this.popularLoader = false )
      )
      .subscribe(
        (res) => {
          if (res?.success) {
            this.popularRestaurant = this.getStoresAsClass(res?.data?.data);
          }
        },
        () => {
        }
      );
  }

  public getTrendingRestaurant(): void {
    this.trendingLoader = true;
    this.storeService
    .getStoreByType('trending', PlatformServices.Food)
    .pipe(
      takeUntil(this.destroyed$),
      finalize(()=> this.trendingLoader = false )
    )
    .subscribe(
      (res) => {
        if (res?.success) {
          this.trendingRestaurant = this.getStoresAsClass(res?.data?.data);
        }
      },
      () => {
      }
    );
  }

  public getRecommendedRestaurant(): void {
    this.recommendedLoader = true;
    this.storeService
      .getRecommendedStore('for_you', PlatformServices.Food)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => {
          this.recommendedLoader = false;
        })
      )
      .subscribe(
        (res) => {
          this.recommendedRestaurant = this.getStoresAsClass(res?.data?.data);
        },
      () => {
      }
      );
  }

  public getPickUpAddress(): void {
    this.pickupAddressSubscription = this.dataService.pickUpAddress.pipe(takeUntil(this.destroyed$)).subscribe((address) => {
      this.pickupAddress = address;
    });
  }
}
