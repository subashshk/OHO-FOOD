import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoresPageRoutingModule } from './stores-routing.module';

import { StoresPage } from './stores.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { UiSharedModule } from 'src/app/ui-shared/ui-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoresPageRoutingModule,
    SharedModule,
    UiSharedModule
  ],
  declarations: [StoresPage],
})
export class StoresPageModule {}
