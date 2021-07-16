import { ApplicationRef, Component, OnInit } from '@angular/core';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { GlobalEventService } from 'src/app/services/events.service';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit {

  favorites = []
  api_done = false;

  refreshIntervalId: any;

  constructor(
    private comService: CommonService,
    public preference: PreferenceService,
    private apiService: ApiService,
    private applicationRef: ApplicationRef,
    private navCtrl: NavController,
    private eventService: GlobalEventService,
    private facebook: Facebook,
    private googlePlus: GooglePlus,
  ) { }

  ngOnInit() {
    this.getUserDetail();    
  }

  async getUserDetail() {
    var sendData = {
      user_id: this.preference.currentUser.id,
      my_user_id: this.preference.currentUser.id
    }
    // await this.comService.showLoader('')
    this.apiService.apiPostFunction('userdetail', sendData).then(result => {
      console.log('userdetail == ', result);
      // this.comService.hideLoader()
      if (result.status == 200) {
        if (result.user_data.status != 1) {
          this.logout();
          return;
        }
        result.favorites.forEach(element => {
          var country = this.preference.countries.filter(item => item.alpha3Code == element.alpha3Code);
          if (country.length > 0) element['flag_url'] = country[0].flag
          element['age'] = element.birthday ? this.comService.calculate_age(element.birthday) : '';
          element['isfavorite'] = true
        });
        this.favorites = result.favorites;
      } else {
        localStorage.removeItem('w_user');      
        localStorage.removeItem('gl_login');
        localStorage.removeItem('fb_login');
        this.preference.currentUser = null;
        this.navCtrl.navigateRoot('login', { animated: true, animationDirection: 'back' });
        this.eventService.publishSomeData({event: 'logedout'});
      }
      this.api_done = true;
    }).catch(error => {
      console.error(error);
    })
  }

  async favorite(user) {
    var sendData = {
      user_id: user.id,
      my_user_id: this.preference.currentUser.id
    }
    await this.comService.showLoader('')
    this.apiService.apiPostFunction('addfavorite', sendData).then(result => {
      console.log('addfavorite == ', result);
      this.comService.hideLoader()
      if (result.status == 200) {
        if (result.data == 1) {
          user.isfavorite = true
        }
        else {
          user.isfavorite = false
        }
        this.applicationRef.tick();
      }      
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader()
    })
  }

  showDetail(user) {
    this.preference.userData = user;
    this.navCtrl.navigateForward('user-profile');
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
    this.getUnreadMsg();
      
    this.refreshIntervalId = setInterval(() => {      
      this.getUnreadMsg();
    }, 8 * 1000)
  }

  ionViewWillLeave() {    
    clearInterval(this.refreshIntervalId);
  }

  logout() {
    this.apiService.apiPostFunction('online', {id: this.preference.currentUser.id, online_status: 0})
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

}
