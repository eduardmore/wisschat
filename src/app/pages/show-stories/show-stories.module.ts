import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowStoriesPageRoutingModule } from './show-stories-routing.module';

import { ShowStoriesPage } from './show-stories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowStoriesPageRoutingModule
  ],
  declarations: [ShowStoriesPage]
})
export class ShowStoriesPageModule {}
