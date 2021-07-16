import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoinsPage } from './coins.page';

const routes: Routes = [
  {
    path: '',
    component: CoinsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoinsPageRoutingModule {}
