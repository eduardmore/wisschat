import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { PreferenceService } from './services/preference.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, Platform } from '@ionic/angular';
import { WebrtcService } from './services/webrtc.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { GlobalEventService } from './services/events.service';
import { TranslateService } from '@ngx-translate/core';
import { MyEvent } from './services/myevent.services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  pageLoaded = false;
  coinInterval: any;

  checkIncomeVideoCall: any;

  constructor(
    private apiService: ApiService,
    public preference: PreferenceService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private platform: Platform,
    private navCtrl: NavController,
    public webRTC: WebrtcService,
    private oneSignal: OneSignal,
    private eventService: GlobalEventService,
    private translate: TranslateService,
    private myEvent: MyEvent,
  ) {
    this.getAllCountries();
    this.initialize();

    this.eventService.getObservable().subscribe(data => {
      if (data.event == 'logedin') {
        if (this.preference.currentUser.user_type != 'employee') {
          this.coinInterval = setInterval(() => {
            this.checkUserCoins();
          }, 17 * 1000);
        }
        this.checkIncomeVC();
      } else if (data.event == 'logedout') {
        clearInterval(this.coinInterval);
        clearInterval(this.checkIncomeVideoCall);
      } else if (data.event == 'vcall_ended') {
        this.checkIncomeVC();
      } else if (data.event == 'vcall_started') {
        clearInterval(this.checkIncomeVideoCall);
      }
    });

    this.myEvent.getLanguageObservable().subscribe(value => {
      this.globalize(value);
    });
  }

  getAllCountries() {
    this.apiService.getCoutries().subscribe((result: any) => {
      this.preference.countries = result;
    })
  }

  initialize() {
    this.platform.ready().then(() => {

      let defaultLang = localStorage.getItem('u_lang') ? localStorage.getItem('u_lang') : 'en';
      this.globalize(defaultLang);

      this.checkPermission();

      ///////////////////////   onesignal //////////////
      this.oneSignal.startInit('e2e0c840-1878-42eb-94eb-0692c9972191', '125009516310');

      this.oneSignal.getTags().then((value) => {
        console.log('Tags Received: ' + JSON.stringify(value));
      });

      this.oneSignal.getIds().then(data => {
        console.log("Onesignal Playerid:= " + data.userId);//  device id
        this.preference.onesignal_token = data.userId;
      });

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

      this.oneSignal.handleNotificationReceived().subscribe((res) => {
        console.log("noti received == ", res.payload.body);
        localStorage.get_noti = true;
      });

      this.oneSignal.handleNotificationOpened().subscribe((res) => {
        this.navCtrl.navigateForward("messages");
        console.log("noti opended == ", res.notification.payload.body);
      });

      this.oneSignal.endInit();
      this.oneSignal.setSubscription(true);
      ////////////////////////////////////////////////////

      // this.geolocation.getCurrentPosition().then((geo: Geoposition) => {
      //   this.preference.lat = geo.coords.latitude
      //   this.preference.lng = geo.coords.longitude
      // });

      if (!localStorage.getItem('filter_gender')) {
        localStorage.setItem('filter_gender', 'Both');
        this.preference.spendCoinValue = 0;
        this.preference.filterGender = 'Both';
      } else {
        var gender = localStorage.getItem('filter_gender');
        this.preference.filterGender = gender;
        if (gender == 'Male') this.preference.spendCoinValue = 5;
        else if (gender == 'Female') this.preference.spendCoinValue = 9;
        else this.preference.spendCoinValue = 0;
      }

      if (localStorage.getItem('w_user') && localStorage.getItem('w_user') != "") {

        this.preference.currentUser = JSON.parse(localStorage.getItem('w_user'));

        if (localStorage.getItem('setting') && localStorage.getItem('setting') != "") {
          if (!localStorage.getItem('permissions')) {
            this.navCtrl.navigateRoot('check-permission');
          } else {
            // setTimeout(() => {
              // this.webRTC.init('' + this.preference.currentUser.id);
            // }, 1500);

            if (this.preference.currentUser.user_type != 'employee') {
              this.checkUserCoins();
              if (!this.coinInterval) {
                this.coinInterval = setInterval(() => {
                  this.checkUserCoins();
                }, 17 * 1000);
              }
            }

            this.navCtrl.navigateRoot('home');
            this.checkIncomeVC();

            this.apiService.apiPostFunction('online', { id: this.preference.currentUser.id, online_status: '1' })
              .then(() => { })
              .catch(error => { })

            this.platform.pause.subscribe(() => {
              this.apiService.apiPostFunction('online', { id: this.preference.currentUser.id, online_status: '0' })
                .then(() => { })
                .catch(error => { })
              clearInterval(this.checkIncomeVideoCall);
            });

            this.platform.resume.subscribe(() => {
              this.apiService.apiPostFunction('online', { id: this.preference.currentUser.id, online_status: '1' })
                .then(() => { })
                .catch(error => { })
              this.checkIncomeVC();
            })
          }
        }
        else this.navCtrl.navigateRoot('settings');
      }
      else this.navCtrl.navigateRoot('login');

      setTimeout(() => {
        this.pageLoaded = true
      }, 1000);

      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      this.statusBar.styleLightContent();

      this.splashScreen.hide();
    });
  }

  checkPermission() {
    // localStorage.setItem('permissions', "done")
    // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
    //   result => {
    //     console.log('Has CAMERA permission? ',result.hasPermission)
    //   },
    //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    // );
  }

  globalize(languagePriority = '') {
    this.translate.setDefaultLang("en");
    let defaultLangCode = "en";
    this.preference.defaultLang = languagePriority;
    this.translate.use(languagePriority != '' ? languagePriority : defaultLangCode);
  }

  checkUserCoins() {
    this.apiService.apiPostFunction('usercoins', {
      user_id: this.preference.currentUser.id
    }).then(result => {
      if (result.status == 200) {
        this.preference.currentUser.coins = result.coins;
      }
    }).catch(error => {
      console.error(error);
    })
  }

  checkIncomeVC() {
    this.checkIncomeVideoCall = setInterval(() => {
      var sendData = {
        my_id: this.preference.currentUser.id
      }
      this.apiService.apiPostFunction('checkincome', sendData).then(result => {
        if (result.status == 200) {
          var call_id = result.call_id;
          var user_data = result.user_data;
          user_data.profile_img = user_data.profile_img.includes('http') ? user_data.profile_img : this.preference.image_url + user_data.profile_img;
          this.preference.vcUser = user_data;

          this.navCtrl.navigateForward('videoroom', { queryParams: { user_id: this.preference.currentUser.id, call_id: call_id, income: true, call_kind: 'random'} });
          clearInterval(this.checkIncomeVideoCall);
        }
      })
    }, 7 * 1000);
  }
}
