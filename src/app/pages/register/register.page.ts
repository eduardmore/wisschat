import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  form: FormGroup;

  agree_term = false;

  constructor(
    private apiService: ApiService,
    public preference: PreferenceService,
    private comService: CommonService,
    private navCtrl: NavController
  ) {
    this.form = new FormGroup({
      name: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      email: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]
      }),
      password: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required, Validators.minLength(6)]
      }),
      c_password: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required, Validators.minLength(6)]
      })
    });
   }

  ngOnInit() {

  }

  async signup() {
    if (this.form.value.password != this.form.value.c_password) {
      var password_dont_match = await this.comService.getTranslationWord('password_dont_match');
      this.comService.showToast(password_dont_match);
      return;
    }
    var sendData = {
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.value.password,
      device_token: this.preference.onesignal_token,
      status: 2
    }
    await this.comService.showLoader('');
    this.apiService.apiPostFunction('register', sendData).then(result => {
      this.comService.hideLoader();
      this.comService.showToast(result.message)
      console.log('register == ', result);
      if (result.status == 200) {
        this.preference.currentUser = result.data;
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        localStorage.removeItem('setting');
        this.navCtrl.navigateRoot('settings', {animated: true, animationDirection: 'forward'});
      }
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader();
    })
  }

  showContent(link) {
    var url = this.preference.image_url + link
    this.apiService.showLinkUrl(url);
  }

}
