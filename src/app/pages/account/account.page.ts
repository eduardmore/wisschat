import { Component, OnInit } from '@angular/core';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { GlobalEventService } from 'src/app/services/events.service';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  userData: any;
  favorites = []

  refreshIntervalId: any;

  constructor(
    private navCtrl: NavController,
    public preference: PreferenceService,
    private alertCtrl: AlertController,
    private apiService: ApiService,
    private eventService: GlobalEventService,
    private facebook: Facebook,
    private googlePlus: GooglePlus,
    private comService: CommonService
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.getUserData();
    this.getUnreadMsg();
  }

  async getUserData() {
    var sendData = {
      user_id: this.preference.currentUser.id,
      my_user_id: this.preference.currentUser.id
    }

    this.apiService.apiPostFunction('userdetail', sendData).then(result => {
      console.log('userdetail == ', result);
      if (result.status == 200) {
        if (result.user_data.status != 1) {
          this.logoutFunction();
          return;
        } else {
          this.userData = result.user_data
          var country = this.preference.countries.filter(item => item.alpha3Code == this.userData.alpha3Code);
          if (country.length > 0) this.userData['flag_url'] = country[0].flag
          this.favorites = result.favorites
        }
      } else {
        localStorage.removeItem('w_user');
        localStorage.removeItem('gl_login');
        localStorage.removeItem('fb_login');
        this.preference.currentUser = null;
        this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' });
        this.eventService.publishSomeData({event: 'logedout'});
      }
    }).catch(error => {
      console.error(error);
    })
  }

  async logout() {
    var sure_logout = await this.comService.getTranslationWord('sure_logout');
    var cancel_txt = await this.comService.getTranslationWord('cancel');
    var yes_txt = await this.comService.getTranslationWord('yes');
    var alert = await this.alertCtrl.create({
      message: sure_logout,
      buttons: [
        {
          text: yes_txt,
          handler: async () => {
            this.logoutFunction();
          }
        },
        {
          text: cancel_txt,
          role: "cancel"
        }
      ]
    });
    alert.present();
  }

  logoutFunction() {
    this.apiService.apiPostFunction('online', {id: this.preference.currentUser.id, online_status: '0'})
    .then((result) => {
      if (result.status == 200) {
        localStorage.removeItem('w_user');
        if (localStorage.getItem('gl_login')) this.googlePlus.logout();
        if (localStorage.getItem('fb_login')) this.facebook.logout();
        localStorage.removeItem('gl_login');
        localStorage.removeItem('fb_login');

        this.preference.currentUser = null;
        this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' });
        this.eventService.publishSomeData({event: 'logedout'});
      }
    })
    .catch(error => {
      console.error(error);
    })
  }

  getUnreadMsg() {
    var sendData: any = {
      user_id: this.preference.currentUser.id
    }
    this.apiService.apiPostFunction('getunreads', sendData).then(result => {
      console.log('getunreads == ', result);
      if (result.status == 200) {
        if (result.data.length > 0) this.eventService.publishSomeData({event: 'new_msg', count: result.data.length})
      }
    })
  }

  ionViewDidEnter() {
    this.refreshIntervalId = setInterval(() => {
      this.getUnreadMsg();
    }, 8 * 1000)
  }

  ionViewWillLeave() {
    clearInterval(this.refreshIntervalId);
  }

  getCoins() {
    this.navCtrl.navigateForward('coins')
  }

}
