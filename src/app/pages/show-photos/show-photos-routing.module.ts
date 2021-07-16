import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowPhotosPage } from './show-photos.page';

const routes: Routes = [
  {
    path: '',
    component: ShowPhotosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowPhotosPageRoutingModule {}
