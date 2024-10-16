import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('./modules/sign-in/sign-in.module').then((m) => m.SignInPageModule),
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./modules/sign-up/sign-up.module').then((m) => m.SignUpPageModule),
  },
  {
    path: 'signup-options',
    loadChildren: () =>
      import('./modules/signup-options/signup-options.module').then(
        (m) => m.SignupOptionsPageModule
      ),
  },
  {
    path: 'registration-success',
    loadChildren: () =>
      import('./modules/registration-success/registration-success.module').then(
        (m) => m.RegistrationSuccessPageModule
      ),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./modules/tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'stores',
    loadChildren: () => import('./modules/stores/stores.module').then((m) => m.StoresPageModule),
  },
  {
    path: 'users',
    loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersPageModule),
  },
  {
    path: 'documentation/:id',
    loadChildren: () =>
      import('./modules/documentation/documentation.module').then((m) => m.DocumentationPageModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then((m) => m.DashboardPageModule),
  },
  {
    path: 'order-detail/:id',
    loadChildren: () =>
      import('./modules/order-detail/order-detail.module').then((m) => m.OrderDetailPageModule),
  },
  {
    path: 'edit-profile',
    loadChildren: () =>
      import('./modules/edit-profile/edit-profile.module').then((m) => m.EditProfilePageModule),
  },
  {
    path: 'messages',
    loadChildren: () =>
      import('./modules/messages/messages.module').then((m) => m.MessagesPageModule),
  },
  {
    path: 'chat-message/:id',
    loadChildren: () =>
      import('./modules/chat-message/chat-message.module').then((m) => m.ChatMessagePageModule),
  },
  {
    path: 'products',
    loadChildren: () => import('./modules/products/products.module').then( m => m.ProductsPageModule)
  },
  {
    path: 'product-details',
    loadChildren: () => import('./modules/product-details/product-details.module').then( m => m.ProductDetailsPageModule)
  },
  {
    path: 'return-details',
    loadChildren: () => import('./modules/return-details/return-details.module').then( m => m.ReturnDetailsPageModule)
  },
  {
    path: 'add-ons',
    loadChildren: () => import('./modules/add-ons/add-ons.module').then( m => m.AddOnsPageModule)
  },
  {
    path: 'real-estate-dashboard',
    loadChildren: () => import('./real-estate/real-estate-dashboard/real-estate-dashboard.module').then( m => m.RealEstateDashboardPageModule)
  },
  {
    path: 'real-estate-offers',
    loadChildren: () => import('./real-estate/real-estate-offers/real-estate-offers.module').then( m => m.RealEstateOffersPageModule)
  },
  {
    path: 'real-estate-products',
    loadChildren: () => import('./real-estate/real-estate-products/real-estate-products.module').then( m => m.RealEstateProductsPageModule)
  },
  {
    path: 'real-estate-details/:id',
    loadChildren: () => import('./real-estate/real-estate-details/real-estate-details.module').then( m => m.RealEstateDetailsPageModule)
  },
  {
    path: 'real-estate-qna/:id',
    loadChildren: () => import('./real-estate/real-estate-qna/real-estate-qna.module').then( m => m.RealEstateQnaPageModule)
  },
  {
    path: 'real-estate-profile',
    loadChildren: () => import('./real-estate/real-estate-profile/real-estate-profile.module').then( m => m.RealEstateProfilePageModule)
  },
  {
    path: 'jobs-dashboard',
    loadChildren: () => import('./jobs/jobs-dashboard/jobs-dashboard.module').then( m => m.JobsDashboardPageModule)
  },
  {
    path: 'job-applications',
    loadChildren: () => import('./jobs/job-applications/job-applications.module').then( m => m.JobApplicationsPageModule)
  },
  {
    path: 'application-details/:id',
    loadChildren: () => import('./jobs/application-details/application-details.module').then( m => m.ApplicationDetailsPageModule)
  },
  {
    path: 'all-jobs',
    loadChildren: () => import('./jobs/all-jobs/all-jobs.module').then( m => m.AllJobsPageModule)
  },
  {
    path: 'job-details/:id',
    loadChildren: () => import('./jobs/job-details/job-details.module').then( m => m.JobDetailsPageModule)
  },
  {
    path: 'jobs-profile',
    loadChildren: () => import('./jobs/jobs-profile/jobs-profile.module').then( m => m.JobsProfilePageModule)
  },
  {
    path: 'company-details',
    loadChildren: () => import('./jobs/company-details/company-details.module').then( m => m.CompanyDetailsPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./modules/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'vehicle-rental-dahsboard',
    loadChildren: () => import('./vehicle-rental/vehicle-rental-dahsboard/vehicle-rental-dahsboard.module').then( m => m.VehicleRentalDahsboardPageModule)
  },
  {
    path: 'vehicle-rental-offers',
    loadChildren: () => import('./vehicle-rental/vehicle-rental-offers/vehicle-rental-offers.module').then( m => m.VehicleRentalOffersPageModule)
  },
  {
    path: 'rental-offer-details/:id',
    loadChildren: () => import('./vehicle-rental/rental-offer-details/rental-offer-details.module').then( m => m.RentalOfferDetailsPageModule)
  },
  {
    path: 'all-vehicles',
    loadChildren: () => import('./vehicle-rental/all-vehicles/all-vehicles.module').then( m => m.AllVehiclesPageModule)
  },
  {
    path: 'vehicle-details/:id',
    loadChildren: () => import('./vehicle-rental/vehicle-details/vehicle-details.module').then( m => m.VehicleDetailsPageModule)
  },
  {
    path: 'vehicle-rental-profile',
    loadChildren: () => import('./vehicle-rental/vehicle-rental-profile/vehicle-rental-profile.module').then( m => m.VehicleRentalProfilePageModule)
  },
  {
    path: 'rewards-landing',
    loadChildren: () => import('./modules/rewards/rewards-landing/rewards-landing.module').then( m => m.RewardsLandingPageModule)
  },
  {
    path: 'reward-type/:type',
    loadChildren: () => import('./modules/rewards/reward-type/reward-type.module').then( m => m.RewardTypePageModule)
  },
  {
    path: 'reward-type-detail/:type/:id',
    loadChildren: () => import('./modules/rewards/reward-type-detail/reward-type-detail.module').then( m => m.RewardTypeDetailPageModule)
  },
  {
    path: 'store-details/:id',
    loadChildren: () => import('./modules/store-details/store-details.module').then( m => m.StoreDetailsPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
