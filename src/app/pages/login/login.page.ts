import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { GlobalEventService } from 'src/app/services/events.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { WebrtcService } from 'src/app/services/webrtc.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form: FormGroup;

  constructor(
    private navCtrl: NavController,
    private comService: CommonService,
    public preference: PreferenceService,
    private apiService: ApiService,
    private webRTC: WebrtcService,
    private eventService: GlobalEventService
  ) {
    this.form = new FormGroup({
      email: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]
      }),
      password: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required, Validators.minLength(6)]
      })
    });
   }

  ngOnInit() {
  }

  ionViewDidEnter() {

  }

  async login() {
    await this.comService.showLoader('');
    var sendData = {
      email: this.form.value.email,
      password: this.form.value.password,
      device_token: this.preference.onesignal_token
    }
    this.apiService.apiPostFunction('login', sendData).then(result => {
      this.comService.hideLoader();
      console.log('result == ', result);
      if (result.status == 200) {
        this.comService.showToast(result.message)
        this.preference.currentUser = result.data;
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        localStorage.setItem('setting', 'done');

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
      } else this.comService.showToast(result.error)
    }).catch(error => {
      this.comService.hideLoader();
      console.log(error);
    })
  }

  fbLogin() {
    this.apiService.facebookLogin();
  }

  glLogin() {
    this.apiService.googlePlusLogin();
  }

}
