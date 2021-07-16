import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'favorites',
    loadChildren: () => import('./pages/favorites/favorites.module').then( m => m.FavoritesPageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./pages/messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'suggestions',
    loadChildren: () => import('./modals/suggestions/suggestions.module').then( m => m.SuggestionsPageModule)
  },
  {
    path: 'coins',
    loadChildren: () => import('./pages/coins/coins.module').then( m => m.CoinsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'user-profile',
    loadChildren: () => import('./pages/user-profile/user-profile.module').then( m => m.UserProfilePageModule)
  },
  {
    path: 'media-manage',
    loadChildren: () => import('./pages/media-manage/media-manage.module').then( m => m.MediaManagePageModule)
  },
  {
    path: 'show-photos',
    loadChildren: () => import('./pages/show-photos/show-photos.module').then( m => m.ShowPhotosPageModule)
  },
  {
    path: 'show-stories',
    loadChildren: () => import('./pages/show-stories/show-stories.module').then( m => m.ShowStoriesPageModule)
  },
  {
    path: 'my-settings',
    loadChildren: () => import('./pages/my-settings/my-settings.module').then( m => m.MySettingsPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'gifts',
    loadChildren: () => import('./modals/gifts/gifts.module').then( m => m.GiftsPageModule)
  },
  {
    path: 'check-permission',
    loadChildren: () => import('./pages/check-permission/check-permission.module').then( m => m.CheckPermissionPageModule)
  },
  {
    path: 'analysis',
    loadChildren: () => import('./pages/analysis/analysis.module').then( m => m.AnalysisPageModule)
  },
  {
    path: 'revenue',
    loadChildren: () => import('./pages/revenue/revenue.module').then( m => m.RevenuePageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./pages/contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'videoroom',
    loadChildren: () => import('./pages/video-room/video-room.module').then( m => m.VideoRoomPageModule)
  },
  {
    path: 'random-vcall',
    loadChildren: () => import('./pages/random-vcall/random-vcall.module').then( m => m.RandomVcallPageModule)
  },
  {
    path: 'search-online',
    loadChildren: () => import('./pages/search-online/search-online.module').then( m => m.SearchOnlinePageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
