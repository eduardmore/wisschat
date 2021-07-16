import { RandomVcallPage } from './../random-vcall/random-vcall.page';
import { GlobalEventService } from 'src/app/services/events.service';
import { ModalController, NavController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.services';
import { ApiService } from 'src/app/services/api.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { Component, OnInit, ApplicationRef } from '@angular/core';

@Component({
  selector: 'app-search-online',
  templateUrl: './search-online.page.html',
  styleUrls: ['./search-online.page.scss'],
})
export class SearchOnlinePage implements OnInit {

  endSearchFlag = false;

  userData: any
  gender = "Both";
  onlineUsers = [];
  selectedID = 0;

  call_id: any;

  constructor(
    public preference: PreferenceService,
    private api: ApiService,
    private comService: CommonService,
    private applicationRef: ApplicationRef,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private eventService: GlobalEventService
  ) { }

  ngOnInit() {
    this.eventService.publishSomeData({ event: 'vcall_started' });
    this.gender = localStorage.getItem('filter_gender') ? localStorage.getItem('filter_gender') : "Both";
    this.getOnlineUser();
  }

  getOnlineUser() {
    var sendData: any = {
      my_user_id: this.preference.currentUser.id
    }
    if (this.gender != "Both") sendData['gender'] = this.gender;
    this.api.apiPostFunction('onlinecheck', sendData).then(async (result) => {
      console.log('online users == ', result);
      if (result.status == 200) {
        result.onlineUsers.forEach(element => {
          var country = this.preference.countries.filter(item => item.alpha3Code == element.alpha3Code);
          if (country.length > 0) element['flag_url'] = country[0].flag
          element['age'] = element.birthday ? this.comService.calculate_age(element.birthday) : ''
        });
        this.onlineUsers = result.onlineUsers;
        if (this.onlineUsers.length > 0) {
          this.userData = this.onlineUsers[0];
          if (this.preference.currentUser.user_type != 'employee') {
            var need_60_min = await this.comService.getTranslationWord('need_60_min');
            this.comService.showToast(need_60_min);
          }
          this.callUser();
        } else {
          var no_online_user = await this.comService.getTranslationWord('no_online_user');
          this.comService.showToast(no_online_user);
          setTimeout(() => {
            this.endPage();
          }, 1500);
        }
      }
    })
  }

  async callUser() {
    if (this.preference.currentUser.user_type != 'employee' && !this.api.availableCall('random')) {
      var dont_have_enough_coin = await this.comService.getTranslationWord('dont_have_enough_coin');
      this.comService.showAlert(dont_have_enough_coin);
      this.endPage();
      setTimeout(() => {
        this.navCtrl.navigateForward('coins');
      }, 1300);
      return;
    } else {
      var sendData = {
        my_id: this.preference.currentUser.id,
        user_id: this.userData.id
      }
      this.api.apiPostFunction('createvideocall', sendData).then(result => {
        if (result.status == 200) {
          this.call_id = result.call_id;
          this.callPage(this.call_id, this.userData.id);
        } else {
          this.searchUser();
        }
      }).catch(error => {
        console.error(error);
        this.searchUser();
      })
    }
  }

  async callPage(call_id, user_id) {
    var modal = await this.modalCtrl.create({
      component: RandomVcallPage,
      componentProps: {
        call_id,
        user_id,
        userData: this.userData
      }
    });
    modal.onDidDismiss().then((data) => {
      if (data.role && data.role == 'next_user') this.searchUser();
      else if (data.role == 'end_search') this.endPage();
    });
    modal.present();
  }

  async searchUser() {
    this.selectedID++;
    if (this.selectedID >= this.onlineUsers.length) {
      var no_online_user = await this.comService.getTranslationWord('no_online_user');
      this.comService.showToast(no_online_user);
      setTimeout(() => {
        this.endPage();
      }, 1500);
      return;
    }
    this.userData = this.onlineUsers[this.selectedID];
    this.applicationRef.tick();
    setTimeout(() => {
      this.callUser();
    }, 2000);
  }

  endPage() {
    this.eventService.publishSomeData({ event: 'vcall_ended' });
    this.navCtrl.pop();
  }

}
