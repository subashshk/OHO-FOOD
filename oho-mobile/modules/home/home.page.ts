import { plainToClass } from 'class-transformer';
import { StoreService } from 'src/app/services/store.service';
import { Store } from './../../models/store.model';
import { Taxons } from './../../models/taxons.model';
import { IonContent, ModalController, NavController } from '@ionic/angular';
import { GlobalEmitterService } from 'src/app/services/global-emitter.service';
import { PlatformService } from './../../services/platform.service';
import { PlatformServices } from './../../enums/services.enum';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { Taxon } from '@globalEnums/taxon.enum';
import { Category } from 'src/app/models/category.model';
import { ProductType } from '@globalEnums/product-type.enum';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { Deal } from 'src/app/models/deal.model';
import { BannerSectionService } from 'src/app/services/banner-section.service';
import { UtilityService } from 'src/app/services/utility.service';
import { subscribedContainerMixin } from 'src/app/shared/subscribedContainer.mixin';
import { finalize, takeUntil } from 'rxjs/operators';
import { CartPage } from '../cart/cart.page';
import { AngularTokenService } from 'angular-token';
import { ProductOrderService } from 'src/app/services/product-order.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ToastDirective } from 'src/app/shared/directives/toast.directive';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage extends subscribedContainerMixin() implements OnInit, OnDestroy {
  categorySlideOpts = {
    slidesPerView: 4,
    spaceBetween: 10,
    freeMode: true,
  };

  categories: Category[];
  isLoading: boolean[] = new Array(Object.keys(ProductType).length / 2);
  topDealsTitle = 'Best Deals & Offers';
  topDealsProducts: Product[] = [];

  featuredTitle = 'Featured Products';

  topSellingTitle = 'Best Sellers';
  topSellingProducts: Product[] = [];

  newArrivalTitle = 'New Arrivals';

  headerSlideOpts = {
    speed: 400,
    autoplay: {
      delay: 5000,
    },
  };

  offersList: Deal[] = [];
  bannerList = [];
  categoriesBannerList = [];
  officialStores: Store[] = [];

  isSearchFocused = false;

  categoryProductList: Taxons[] = [];
  offerProductsCount = 10;
  newArrivalOffer: Deal;
  featuredOffer: Deal;

  listSlideOpts = {
    slidesPerView: 2.25,
    freeMode: true,
    spaceBetween: 10,
  };

  spotlightStore: string;
  spotlightProducts: Product[] = [];
  storesSlideOpts = {
    spaceBetween: 10,
    slidesPerView: 1.5,
    freeMode: true,
  };
  cartCount = 0;
  currentServiceType: PlatformServices;

  productCountChangedSubscription: Subscription;

  @ViewChild(IonContent, { read: IonContent, static: false })
  public content: IonContent;
  public backToTop: boolean = false;
  public bannerLoad: boolean = false;
  public featuredLoader: boolean = false;
  public spotlightLoader: boolean = false;
  public productTypes = ProductType;
  public categoriesLoader: boolean = false;
  public officialLoader: boolean = false;
  public discounts: any;
  public isDiscountsLoading: boolean = false;
  public homePageCategories: any = [
    {
      label : 'Popular',
      discount: 'Upto 40% off',
      icon: 'icon-popular-products',
      productType: ProductType.BestSelling
    },
    {
      label : 'Trending',
      discount: 'Upto 40% off',
      icon: 'icon-trending-products',
      productType: ProductType.Trending
    },
    {
      label : 'New',
      discount: 'Upto 40% off',
      icon: 'icon-deals-products',
      productType: ProductType.RecentlyAdded
    },
    {
      label : 'Deals',
      discount: 'Upto 40% off',
      icon: 'icon-new-products',
      productType: ProductType.TopDeals
    }
  ]

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private bannerService: BannerSectionService,
    public utility: UtilityService,
    private globalEmitterService: GlobalEmitterService,
    private navCtrl: NavController,
    private storeService: StoreService,
    private toastDirective: ToastDirective,
    private dataService: DataService,
    private modalController: ModalController,
    private tokenService: AngularTokenService,
    private productOrderService: ProductOrderService,
    private platformService: PlatformService,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit() {
    this.initialize();
    this.watchCartCountChange();
    this.getDiscountPercents();
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
    this.dataService.setShowToastCart(false);
    if (this.productCountChangedSubscription) {
      this.productCountChangedSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isSearchFocused = false;
  }

  public getDiscountPercents(): void {
    this.isDiscountsLoading = true;
    this.productService.getDiscountPercents()
    .pipe(finalize(() => this.isDiscountsLoading = false))
    .subscribe((res) => {
      if (res?.success) {
        this.discounts = res?.data;
      }
    },
  (err) => {
    this.toastService.presentToast('Failed to fetch discount percents');
  })
  }

  doRefresh(event): void {
    this.dataService.setShowToastCart(false);
    this.initialize(event);
  }

  navigateTo(url: string): void {
    this.navCtrl.navigateForward(url);
  }

  get platformServices(): any {
    return PlatformServices;
  }

  get productType(): any {
    return ProductType;
  }

  navigateToStore(storeId: number): void {
    this.navCtrl.navigateForward('store/' + storeId);
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

  initialize(event = null): void {
    this.dataService.showToastCart
      .subscribe((res) => {
        if(res) {
          this.toastDirective.message = 'Product added to cart';
          this.toastDirective.duration = 3400;
          this.toastDirective.icon = 'icon-cart';
          this.toastDirective.show();
        }
      });
    this.currentServiceType = this.platformService.getCurrentServiceType();
    this.topDealsProducts = [];
    this.topSellingProducts = [];
    this.categories = [];
    this.getOrdersCount();
    this.getBanners();
    this.getCategories();
    this.getSpotlightStore();
    this.getCategoryProducts();
    this.getOfficialStores();



    // TODO: find a way to complete the event without timeout
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 2000);
    }
  }

  setIsSearchFocused(isFocused: boolean) {
    this.isSearchFocused = isFocused;
  }

  public getOrdersCount = (): void => {
    this.tokenService
      .validateToken()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((stat) => {
        this.productOrderService
          .getOrdersCount(this.currentServiceType)
          .pipe(takeUntil(this.destroyed$))
          .subscribe((res) => {
            if (res) {
              if (res.data.productsCount) {
                this.cartCount = res.data.productsCount;
              } else {
                this.cartCount = res.data.productsCount;
              }
            }
          });
      });
  };

  getBanners(): void {
    this.bannerLoad = true;
    this.bannerService
      .getGroupedBanners('home', PlatformServices.Mall)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.getCategories();
          if (res.success) {
            this.bannerLoad = false;
            this.bannerList = res.data.data[PlatformServices.Mall + 'HomeSlider'];
            this.categoriesBannerList =
              res.data.data[PlatformServices.Mall + 'HomePageBannerBelowCategoriesMobile'];
          }
        },
        () => {
          this.bannerLoad = false;
        }
      );
  }

  setNextDealProducts(productType?: ProductType): void {
    this.getProductOffers();
    this.getProductsByType(ProductType.BestSelling);
    this.getProductsByType(ProductType.TopDeals);
  }

  getCategories(): void {
    this.categoryService
      .getCategoryTree(Taxon.Categories, PlatformServices.Mall)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          this.categories = [];
          res?.data?.data.forEach((category) => {
            this.categories.push(plainToClass(Category, category));
          });
        }
      );
  }

  getCategoryProducts(): void {
    this.categoriesLoader = true;
    this.productService
      .getCategoryProducts(10, PlatformServices.Mall)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.categoriesLoader = false)
      )
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

  goToTaxon(category: Category): void {
    this.navCtrl.navigateForward('search-results', {
      queryParams: {
        taxonName: category.name,
      },
    });
  }

  public getProductsByType(productType): void {
    this.isLoading[productType] = true;
    this.productService
      .getProductsByType(productType, PlatformServices.Mall)
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
        (err) => {
          this.isLoading[productType] = false;
        }
      );
  }

  public getProductOffers(): void {
    this.featuredLoader = true;
    this.productService
      .getProductOffers(PlatformServices.Mall, this.offerProductsCount)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.featuredLoader = false )
      )
      .subscribe(
        (res) => {
          this.getSpotlightStore();
          if (res.success) {
            this.offersList = res.data.data;
            this.newArrivalOffer = this.offersList.find((offer) => {
              return offer.name === 'New Arrivals' && offer.products.length > 0;
            });

            this.featuredOffer = this.offersList.find((offer) => {
              return offer.name === 'Featured' && offer.products.length > 0;
            });
          }
        },
        () => {
        }
      );
  }

  goToCategory(category: Category): void {
    if (category.taxons.length > 0) {
      this.globalEmitterService.selectCategory.emit(category.name);
      this.navCtrl.navigateForward(['tabs/categories'], {
        queryParams: {
          category: category.name,
        },
      });
    }
    if (category.taxons.length < 1) {
      this.goToTaxon(category);
    }
  }

  shopMore(type: ProductType, deal?: string): void {
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

  goToProductListing(type: ProductType, deal?: string): void {
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

  public getSpotlightStore(): void {
    this.spotlightLoader = true;
    this.spotlightProducts = [];
    this.productService
      .getSpotlightProducts(PlatformServices.Mall)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.spotlightLoader = false )
      )
      .subscribe(
        (res) => {
          if (res.success) {
            this.spotlightStore = res.data.name;
            res?.data?.data.forEach((product) => {
              this.spotlightProducts.push(plainToClass(Product, product));
            });
          }
        },
        (err) => {
        }
      );
  }

  getOfficialStores(): void {
    this.officialLoader = true;
    this.storeService
      .getOfficialStores(PlatformServices.Mall)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.officialLoader = false)
      )
      .subscribe(
        (res) => {
          if (res.data.data) {
            this.officialStores = plainToClass(Store, res.data.data);
          }
        },
        (err) => {
        }
      );
  }

  public getScrollPosition(pos: number): void {
    this.backToTop = pos > 120;
  }
}
