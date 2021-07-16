import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoinsPageRoutingModule } from './coins-routing.module';

import { CoinsPage } from './coins.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoinsPageRoutingModule,
    TranslateModule
  ],
  declarations: [CoinsPage]
})
export class CoinsPageModule {}
