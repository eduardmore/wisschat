import { Component, OnInit, ViewChild } from '@angular/core';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { IonSlides, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { GlobalEventService } from 'src/app/services/events.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { WebrtcService } from 'src/app/services/webrtc.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  @ViewChild('settingSlides', {static: true}) settingSlides: IonSlides

  sliderConfig = {
    slidesPerView: 1,
    initialSlide: 0,
    spaceBetween: 0
  }

  countries = []

  selectedGender = false;

  status: any;
  gender: any;
  country_id: any;
  country_code: any;
  phone: any;
  address = ''
  city = ''
  birthday: any = '2003-01-01'


  constructor(
    private apiService: ApiService,
    public preference: PreferenceService,
    private comService: CommonService,
    private navCtrl: NavController,
    public webRTC: WebrtcService,
    private facebook: Facebook,
    private googlePlus: GooglePlus,
    private eventService: GlobalEventService
  ) { }

  ngOnInit() {
    this.phone = this.preference.currentUser.phone ? this.preference.currentUser.phone : '';
    this.getCountries();
    this.settingSlides.lockSwipeToNext(true);
  }

  getCountries() {
    this.apiService.apiGetFunction('countries').then(result => {
      if (result.status == 200) {
        result.data.forEach(element => {
          var country = this.preference.countries.filter(item => item.alpha3Code == element.countries_iso_code_3);
          if (country.length > 0) element['flag_url'] = country[0].flag
        });
        this.countries = result.data;
        console.log('countries == ', this.countries)
      }
    })
  }

  async changeGender(event) {
    if (!this.selectedGender) {
      var you_cant_change = await this.comService.getTranslationWord('you_cant_change');
      this.comService.showAlert(you_cant_change);
      this.selectedGender = true;
    }
    if (this.gender == 'Male') this.status = 1;
    else this.status = 2;
  }

  selectCountry(event) {
    var country = this.countries.filter(item => item.countries_id == this.country_id);
    if (country.length > 0) this.phone = this.country_code = (country[0].country_code as string).includes("+") ? country[0].country_code : '+' + country[0].country_code
  }

  async next() {
    await this.settingSlides.lockSwipeToNext(false);
    this.settingSlides.slideNext();
    await this.settingSlides.lockSwipeToNext(true);
    await this.settingSlides.lockSwipeToPrev(true);
  }

  async update() {

    if (!this.country_id || this.phone.length < 12) {
      var some_incorrect = await this.comService.getTranslationWord('some_incorrect');
      this.comService.showAlert(some_incorrect);
      return;
    }

    await this.comService.showLoader('');
    var sendData = {
      id: this.preference.currentUser.id,
      gender: this.gender,
      country_id: this.country_id,
      phone: this.phone,
      address: this.address,
      city: this.city,
      birthday: this.birthday,
      status: this.status,
      profile_img: this.preference.currentUser.profile_img ? this.preference.currentUser.profile_img : (this.gender == 'Male') ? 'uploads/images/default_man.jpg' : 'uploads/images/default_woman.jpg',
    }
    this.apiService.apiPostFunction('setting', sendData).then(async (result) => {
      this.comService.hideLoader();
      console.log('result == ', result);
      if (result.status == 200) {
        localStorage.setItem('setting', 'done');
        if (this.status == 2) {
          var account_pending = await this.comService.getTranslationWord('account_pending');
          this.comService.showAlert(account_pending);
          this.preference.currentUser = null;
          localStorage.removeItem('w_user');
          if (localStorage.getItem('gl_login')) this.googlePlus.logout();
          if (localStorage.getItem('fb_login')) this.facebook.logout();
          localStorage.removeItem('gl_login');
          localStorage.removeItem('fb_login');

          this.navCtrl.navigateRoot('login', {animated: true, animationDirection: 'back'});
        } else {
          this.preference.currentUser = result.data;
          localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));

          if (!localStorage.getItem('permissions')) {
            this.navCtrl.navigateRoot('check-permission', {animated: true, animationDirection: 'forward'});
          } else {
            // this.webRTC.init('' + this.preference.currentUser.id);
            this.navCtrl.navigateRoot('home', {animated: true, animationDirection: 'forward'});
            this.apiService.apiPostFunction('online', {id: this.preference.currentUser.id, online_status: '1'})
            .then(() => {})
            .catch(error => {})
          }
          this.eventService.publishSomeData({event: 'logedin'});
        }
      }
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader();
    })
  }

}
