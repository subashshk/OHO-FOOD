import { OTP } from "./../../../models/otp.model";
import { Component, OnInit, ElementRef, ViewChild, Input } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import { Country, ICountry } from "country-state-city";
import { subscribedContainerMixin } from "src/app/shared/subscribedContainer.mixin";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProfileService } from "src/app/services/profile.service";
import { takeUntil } from "rxjs/operators";
import { ModalController, NavController } from "@ionic/angular";
import { AddStoreComponent } from "../add-store/add-store.component";

@Component({
  selector: "app-otp-verification",
  templateUrl: "./otp-verification.component.html",
  styleUrls: ["./otp-verification.component.scss"],
})
export class OtpVerificationComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  @ViewChild("country", { static: false }) country: ElementRef;
  @Input() signupForm: FormGroup;

  public OTP: OTP = {
    first: "",
    second: "",
    third: "",
    forth: "",
    fifth: "",
    sixth: "",
  };
  public otpMessageSuccess: boolean = false;
  public countryNepal: ICountry[] = [];
  public selectedCountry: ICountry[] = [];
  public countries: ICountry[] = Country.getAllCountries();
  public nepal: string = "Nepal";
  public getError: boolean = false;
  public sendOTP: string = "";
  public givenEmail: string = "";
  public sendOTPAgain: boolean = false;
  public maxTime: number = 59;
  public signupMobileForm: FormGroup;
  public mobileNumber: string = "";
  public isLoading: boolean = false;
  public isFocusedName: boolean = false;

  constructor(
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private router: Router,
    private profileService: ProfileService,
    private modalController: ModalController,
    private navCtrl: NavController,
  ) {
    super();
    this.signupMobileForm = this.createSignupForm();
  }

  public createSignupForm(): FormGroup {
    return this.formBuilder.group({
      mobileNumber: [
        "",
        [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")],
      ],
    });
  }

  public getMobileNumberErrorMsg(): string {
    if (this.signupMobileForm.controls.mobileNumber.errors.required) {
      return "Mobile number is required.";
    } else {
      return "Mobile number is not valid.";
    }
  }

  public getCountDown(): void {
    setTimeout(() => {
      this.maxTime--;
      if (this.maxTime > 0) {
        this.getCountDown();
      } else {
        this.sendOTPAgain = true;
      }
    }, 1000);
  }

  public resetTimerValue(): void {
    this.maxTime = 59;
    this.sendOTPAgain = false;
    this.getCountDown();
  }

  public back(): void {
    this.navCtrl.back();
  }

  public register(): void {
    if (this.signupMobileForm.valid) {
      this.otpMessageSuccess = true;
      this.mobileNumber = this.signupForm.value.mobileNumber;
      this.resetTimerValue();
    }
  }

  public resendOTP(): void {
    this.isLoading = true;
    this.profileService
      .postOTPMobileNumber(this.mobileNumber, this.givenEmail)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success) {
            this.isLoading = false;
            this.resetTimerValue();
            this.toastService.presentToast(
              "OTP has been send successfully.",
              2000
            );
          }
        },
        (err) => {
          this.toastService.presentToast(
            "Something went wrong.",
            2000,
            "danger"
          );
        }
      );
  }

  public ngOnInit(): void {
    this.getCountryNepal();
    this.mobileNumber = this.signupForm.value.mobileNumber;
    this.givenEmail = this.signupForm.value.email;
    this.getCountDown();
  }

  public getCountryNepal(): void {
    this.countryNepal = this.countries.filter(
      (country) => country.name === this.nepal
    );
  }

  public onCountryChange($event): void {
    this.selectedCountry = JSON.parse(this.country.nativeElement.value);
  }

  public otpMainInput(event, next, prev): number {
    if (event.target.value === "." || event.target.value === ",") {
      return (event.target.value = null);
    }

    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    } else if (next && event.target.value.length > 0) {
      next.setFocus();
    } else {
      return 0;
    }
  }

  public signUpValidate(): void {
    this.sendOTP =
      this.OTP.first +
      this.OTP.second +
      this.OTP.third +
      this.OTP.forth +
      this.OTP.fifth +
      this.OTP.sixth;
    this.profileService
      .getOTP(this.givenEmail, this.sendOTP, this.mobileNumber)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (res) => {
          if (res.success) {
            this.toastService.presentToast("Successfully verified", 2000);
            this.router.navigateByUrl("sign-in");
          } else {
            this.getError = true;
          }
        },
        (err) => {
          this.getError = true;
          this.toastService.presentToast(
            "Something went wrong.",
            2000,
            "danger"
          );
        }
      );
  }

  private async addStoreInfo(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddStoreComponent,
      cssClass: 'store-modal',
      componentProps: {
        step: 1,
        fromDashboard: false,
      },
      backdropDismiss: false,
    });
    return await modal.present();
  }

  public goToSignUpPage(): void {
    this.maxTime = 0;
    this.otpMessageSuccess = false;
  }

  public onFocus(event: string): void {
    this[event] = true;
  }

  public onBlur(event: string): void {
    this[event] = false;
  }
}
