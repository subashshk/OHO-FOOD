import { environment } from "./../environments/environment";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { AngularTokenModule } from "angular-token";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormatterInteceptor } from "./shared/inteceptor/formatter-inteceptor";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Camera } from "@ionic-native/camera/ngx";
import { MaskitoModule } from '@maskito/angular';
import { BarcodeScanner } from "@awesome-cordova-plugins/barcode-scanner/ngx";

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularTokenModule.forRoot({
      apiBase: environment.apiURL,
      apiPath: null,
      signInPath: "auth/sign_in",
      signInRedirect: "/login",
    }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,
    MaskitoModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: FormatterInteceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Camera,
    BarcodeScanner
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
