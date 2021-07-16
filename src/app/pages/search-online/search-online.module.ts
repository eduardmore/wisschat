import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchOnlinePageRoutingModule } from './search-online-routing.module';

import { SearchOnlinePage } from './search-online.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchOnlinePageRoutingModule,
    TranslateModule
  ],
  declarations: [SearchOnlinePage]
})
export class SearchOnlinePageModule {}
