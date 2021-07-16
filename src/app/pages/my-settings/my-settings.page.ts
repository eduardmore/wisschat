import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { MyEvent } from 'src/app/services/myevent.services';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-my-settings',
  templateUrl: './my-settings.page.html',
  styleUrls: ['./my-settings.page.scss'],
})
export class MySettingsPage implements OnInit {

  gender = "Both";
  lang = 'en';

  constructor(
    private comService: CommonService,
    private apiService: ApiService,
    public preference: PreferenceService,
    private myEvent: MyEvent,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.gender = localStorage.getItem('filter_gender') ? localStorage.getItem('filter_gender') : "Both";
    this.lang = this.preference.defaultLang;
  }

  changeGender($event) {
    this.comService.showLoader3()
    localStorage.setItem('filter_gender', this.gender);
    this.preference.filterGender = this.gender;
    if (this.gender == 'Male') this.preference.spendCoinValue = 5;
    else if (this.gender == 'Female') this.preference.spendCoinValue = 9;
    else this.preference.spendCoinValue = 0;
  }

  showContent(link) {
    var url = this.preference.image_url + link
    this.apiService.showLinkUrl(url);
  }

  changeLang($event) {
    localStorage.setItem('u_lang', this.lang);
    this.myEvent.setLanguageData(this.lang);
    setTimeout(() => {
      // location.reload();
    }, 1000);
  }

  support() {
    this.navCtrl.navigateForward('contact-us', {queryParams: {from: 'support'}});
  }

}
