import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowStoriesPage } from './show-stories.page';

const routes: Routes = [
  {
    path: '',
    component: ShowStoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowStoriesPageRoutingModule {}
