import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GiftsPage } from './gifts.page';

const routes: Routes = [
  {
    path: '',
    component: GiftsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GiftsPageRoutingModule {}
