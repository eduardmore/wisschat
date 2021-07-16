import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchOnlinePage } from './search-online.page';

const routes: Routes = [
  {
    path: '',
    component: SearchOnlinePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchOnlinePageRoutingModule {}
