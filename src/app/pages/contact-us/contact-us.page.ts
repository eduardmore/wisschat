import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { CommonService } from './../../services/common.services';
import { NavController } from '@ionic/angular';
import { PreferenceService } from './../../services/preference.service';
import { Component, OnInit, ApplicationRef } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  subject = '';
  desciption = '';
  from = 'revenue';

  constructor(
    public preference: PreferenceService,
    private navCtrl: NavController,
    private comService: CommonService,
    private api: ApiService,
    private applicationRef: ApplicationRef,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      const {from, ...others} = params;
      if (from) this.from = from;
    })
  }

  ngOnInit() {
    console.log('from == ', this.from);
  }

  async sendMail() {
    if (this.subject == '' || this.desciption == '') return;

    await this.comService.showLoader('');
    var sendData: any = {
      name: this.preference.currentUser.name,
      email: this.preference.currentUser.email,
      subject: this.subject,
      contact: this.desciption,
      from: this.from
    }
    this.api.apiPostFunction('sendcontact', sendData).then(result => {
      console.log('sendcontact == ', result);
      this.comService.hideLoader();
      if (result.status == 200) {
        this.comService.showToast(result.message);
        this.subject = '';
        this.desciption = '';
      }
      this.applicationRef.tick();
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader();
    });
  }

}
