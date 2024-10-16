import { AngularTokenService } from 'angular-token';
import { MoreOptionsComponent } from './../../shared/components/more-options/more-options.component';
import { ProductOrderService } from './../../services/product-order.service';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { CartPage } from './../cart/cart.page';
import { UtilityService } from './../../services/utility.service';
import { subscribedContainerMixin } from './../../shared/subscribedContainer.mixin';
import { takeUntil } from 'rxjs/operators';
import { GlobalEmitterService } from './../../services/global-emitter.service';
import { Category } from 'src/app/models/category.model';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './../../services/product.service';
import { Product } from './../../models/product.model';
import { PlatformService } from './../../services/platform.service';
import { PlatformServices } from './../../enums/services.enum';
import { CategoryService } from './../../services/category.service';
import { Taxon } from './../../enums/taxon.enum';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductType } from '@globalEnums/product-type.enum';
import * as _ from 'lodash';
import { BannerSectionService } from 'src/app/services/banner-section.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-food-categories',
  templateUrl: './food-categories.page.html',
  styleUrls: ['./food-categories.page.scss'],
})
export class FoodCategoriesPage extends subscribedContainerMixin() implements OnInit, OnDestroy {
  currentCategory: Category;
  categories: Category[];
  isLoading = true;
  currentServiceType: PlatformServices;
  platformServices = PlatformServices;
  searchText: string;
  products: Product[];
  sortType = { key: 'Popularity', type: 'orders', order: 'desc' };
  categoryName = '';
  categoryTree: Category[];

  filters = [];
  pageIndex = 1;
  perPage = 10;
  bannerList = [];

  searchBarIsExpanded = false;

  headerSlideOpts: any;

  cartCount = 0;
  previousRoute = '';

  productCountChangedSubscription: Subscription;
  selectCategorySubscription: Subscription;

  constructor(
    private categoryService: CategoryService,
    private platformService: PlatformService,
    private productService: ProductService,
    private globalEmitterService: GlobalEmitterService,
    private bannerService: BannerSectionService,
    public utility: UtilityService,
    private modalController: ModalController,
    private productOrderService: ProductOrderService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private popoverController: PopoverController,
    private tokenService: AngularTokenService
  ) {
    super();
  }

  get currentCategoryName(): string {
    if (this.currentCategory && this.currentCategory.name) {
      return this.currentCategory.name;
    }
    return 'Cuisines';
  }

  ionViewWillEnter() {
    this.searchBarIsExpanded = false;
    this.previousRoute = localStorage.getItem('previousUrl') || '';
  }

  back(): void {
    if (this.currentCategory) {
      this.returnToPreviousCategory();
    } else {
      this.navCtrl.navigateBack(this.previousRoute);
    }
  }

  ngOnInit() {
    this.initialize();
    this.getOrdersCount();
    this.productCountChangedSubscription = this.globalEmitterService.productCountChanged.subscribe(
      (res) => {
        if (res && res.data && res.data.productsCount) {
          this.cartCount = res.data.productsCount;
        } else {
          this.cartCount = 0;
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.productCountChangedSubscription) {
      this.productCountChangedSubscription.unsubscribe();
    }
    if (this.selectCategorySubscription) {
      this.selectCategorySubscription.unsubscribe();
    }
  }

  doRefresh(event): void {
    this.products = [];
    this.isLoading = true;
    if (this.currentCategory) {
      this.searchAndFilterProduct();
    } else {
      this.populateCategories();
    }
  }

  initialize(): void {
    this.isLoading = true;
    this.products = [];
    this.currentServiceType = this.platformService.getCurrentServiceType();
    this.getBanners();
    if (
      this.activatedRoute.snapshot.queryParams.category &&
      this.activatedRoute.snapshot.queryParams.category !== 'All categories'
    ) {
      this.populateCategories(this.activatedRoute.snapshot.queryParams.category);
    } else {
      this.populateCategories();
    }
    this.selectCategorySubscription = this.globalEmitterService.selectCategory.subscribe(
      (res: string) => {
        this.currentServiceType = this.platformService.getCurrentServiceType();
        if (this.currentServiceType === PlatformServices.Food) {
          this.resetCategories(res);
        }
      }
    );
  }

  resetCategories(name: string): void {
    this.getBanners();
    if (name && name !== 'All categories') {
      this.populateCategories(name);
    } else {
      this.populateCategories();
    }
  }

  async presentPopover(event: any): Promise<any> {
    const popover = await this.popoverController.create({
      component: MoreOptionsComponent,
      event,
      cssClass: 'product-details-popover',
      showBackdrop: false,
    });
    return await popover.present();
  }

  async openCartModal(): Promise<any> {
    const modal = await this.modalController.create({
      component: CartPage,
      componentProps: {
        isModalComponent: true,
      },
    });
    return await modal.present();
  }

  public getOrdersCount(): void {
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
  }

  getBanners(): void {
    this.bannerService
      .getGroupedBanners('categories', this.currentServiceType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.success) {
          this.bannerList = res.data.data[this.currentServiceType + 'CategoriesSlider'];
        }
      });
  }

  returnToPreviousCategory(): void {
    this.products = [];
    this.categoryTree.forEach((category) => {
      if (_.isEqual(this.currentCategory, category)) {
        this.categories = this.categoryTree;
        this.currentCategory = null;
      }
      if (category.taxons.length > 0) {
        this.setCurrentCategoryIfFound(category);
      }
    });
  }

  setCurrentCategoryIfFound(category: Category): void {
    category.taxons.forEach((taxon) => {
      if (_.isEqual(this.currentCategory, taxon)) {
        this.selectCategory(category);
      }
      if (taxon.taxons.length > 0) {
        this.setCurrentCategoryIfFound(taxon);
      }
    });
  }

  populateCategories(cat?: string): void {
    this.categoryService
      .getCategoryTree(Taxon.Categories, this.currentServiceType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.data.data) {
          this.categories = res.data.data;
          this.categoryTree = res.data.data;
          if (cat) {
            this.selectCategory(this.categories[this.categories.findIndex((i) => i.name === cat)]);
          } else {
            this.isLoading = false;
          }
        }
      });
  }

  selectCategory(category: Category): void {
    this.currentCategory = category;
    this.categories = this.currentCategory.taxons;
    this.searchAndFilterProduct();
  }

  goToCategory(category: Category): void {
    this.navCtrl.navigateForward('search-results', {
      queryParams: { category: category.name, taxons: category.id },
    });
  }

  searchAndFilterProduct(): void {
    this.isLoading = true;
    this.productService
      .searchAndFilterProducts(
        this.searchText,
        this.filters,
        this.sortType,
        this.pageIndex,
        this.perPage,
        this.currentCategory.id.toString(),
        null,
        ProductType.All,
        this.currentServiceType
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.data.data) {
            this.products = res.data.data;
          }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }

  viewAll(): void {
    this.navCtrl.navigateForward('search-results', {
      queryParams: { category: this.currentCategory.name, taxons: this.currentCategory.id },
    });
  }

  searchBarExpanded(expanded: boolean): void {
    this.searchBarIsExpanded = expanded;
  }
}
