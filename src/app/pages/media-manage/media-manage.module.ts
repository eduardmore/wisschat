import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MediaManagePageRoutingModule } from './media-manage-routing.module';

import { MediaManagePage } from './media-manage.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MediaManagePageRoutingModule,
    TranslateModule
  ],
  declarations: [MediaManagePage]
})
export class MediaManagePageModule {}
