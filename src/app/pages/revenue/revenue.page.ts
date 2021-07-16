import { NavController } from '@ionic/angular';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';

import format from 'date-fns/format';
import moment from 'moment';

@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.page.html',
  styleUrls: ['./revenue.page.scss'],
})
export class RevenuePage implements OnInit {

  data = [];
  api_done = false;

  start_date = '';
  end_date = moment().format('Y-MM-DD');
  total_revenue = 0;
  total_match = 0;

  constructor(
    public preference: PreferenceService,
    private api: ApiService,
    private comService: CommonService,
    private applicationRef: ApplicationRef,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    moment().format('hh:mm:ss')
    console.info(moment().format('Y-MM-DD'))
    console.info(format(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'))
    this.start_date = format(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd');
  }

  ionViewDidEnter() {
    this.total_revenue = 0;
    this.total_match = 0;
    this.getData();
  }

  getData() {
    var sendData = {
      user_id: this.preference.currentUser.id
    }
    this.api.apiPostFunction('getrevenuematch', sendData).then(result => {
      console.log('revenue == ', result);
      this.api_done = true;
      if (result.status == 200) {
        this.data = result.data;
        this.data.forEach(ele => {
          this.total_revenue += Number(ele.revenue);
          this.total_match += Number(ele.matches)
        });
      }
    }).catch(error => {
      console.error(error);
      this.api_done = true;
    })
  }

  contactus() {
    this.navCtrl.navigateForward('contact-us');
  }

}
