import { ApiService } from 'src/app/services/api.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { CommonService } from './../../services/common.services';
import { NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form: FormGroup;

  constructor(
    private navCtrl: NavController,
    private comService: CommonService,
    public preference: PreferenceService,
    private apiService: ApiService,
  ) {
    this.form = new FormGroup({
      email: new FormControl('', {
        updateOn: 'change',
        validators: [Validators.required, Validators.email, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]
      })
    });
  }

  ngOnInit() {
  }

  async submit() {
    await this.comService.showLoader('');
    this.apiService.apiPostFunction('forgotpassword', {email: this.form.value.email}).then(result => {
      console.log('forgot pass == ', result);
      this.comService.hideLoader();
      if (result.status == 200) {
        this.comService.showToast(result.message);
        this.navCtrl.pop();
      } else {
        this.comService.showToast(result.message);
      }
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader();
    })
  }

}
