import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MediaManagePage } from './media-manage.page';

const routes: Routes = [
  {
    path: '',
    component: MediaManagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MediaManagePageRoutingModule {}
