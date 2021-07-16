import { ChatComponent } from './shared/components/chat/chat.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { SuggestionsPageModule } from './modals/suggestions/suggestions.module';
// import { NgxAgoraModule, AgoraConfig } from 'ngx-agora';
// import { AngularAgoraRtcModule } from 'angular-agora-rtc';
import { Camera } from '@ionic-native/camera/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Media } from '@ionic-native/media/ngx';

import { InAppPurchase } from '@ionic-native/in-app-purchase/ngx';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { VideoRoomPageModule } from './pages/video-room/video-room.module';

import firebase from 'firebase/app';
import { firebaseConfig } from 'src/environments/environment';

firebase.initializeApp(firebaseConfig);

// const agoraConfig: AgoraConfig = {
//   AppID: '09eb886f2167484a8cc2dbbb7fefacac'
// };

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    NgxIonicImageViewerModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SuggestionsPageModule,
    // NgxAgoraModule.forRoot(agoraConfig),
    // AngularAgoraRtcModule.forRoot(agoraConfig),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    VideoRoomPageModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    StatusBar,
    SplashScreen,
    Camera,
    AndroidPermissions,
    HTTP,
    NativeAudio,
    FileTransfer,
    File,
    InAppBrowser,
    Media,
    InAppPurchase,
    InAppPurchase2,
    OneSignal,
    MediaCapture,
    Facebook,
    GooglePlus
  ],
  bootstrap: [AppComponent],

  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
