import { ApplicationRef, Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  styleUrls: ['./analysis.page.scss'],
})
export class AnalysisPage implements OnInit {

  duration = '24h';
  api_done = false;
  users = [];

  constructor(
    private apiService: ApiService,
    public preference: PreferenceService,
    private comService: CommonService,
    private applicationRef: ApplicationRef,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  segmentChanged($event) {
    this.users = [];
    this.api_done = false;
    this.getAnalysis();
  }

  ionViewDidEnter() {
    this.users = [];
    this.api_done = false;
    this.getAnalysis();
  }

  getAnalysis() {
    var sendData: any = {
      type: this.duration,
      user_id: this.preference.currentUser.id
    }
    this.apiService.apiPostFunction('analysis', sendData).then(result => {
      console.log('analysis == ', result);
      if (result.status == 200) {
        this.users = result.data;
        this.users.forEach(ele => {
          var country = this.preference.countries.filter(item => item.alpha3Code == ele.user_info.alpha3Code);
          if (country.length > 0) ele.user_info['flag_url'] = country[0].flag
          ele.user_info['age'] = ele.user_info.birthday ? this.comService.calculate_age(ele.user_info.birthday) : ''
        })
      }
      this.api_done = true;
    }).catch(error => {
      console.error(error);
      this.api_done = true;
    });
  }

}
