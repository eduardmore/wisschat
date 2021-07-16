import { ApplicationRef, Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';

import moment from 'moment';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {

  @ViewChild('userSlide', {static: true}) userSlide: IonSlides

  sliderConfig = {
    slidesPerView: 2.3,
    initialSlide: 0,
    spaceBetween: 0
  }

  members = []
  api_done = false;

  gender = "Both"
  last_id = 0;
  moreLoad = true

  chatters = [];
  moment: any;
  apiDone = false;

  refreshIntervalId: any;

  constructor(
    private apiService: ApiService,
    public preference: PreferenceService,
    private comService: CommonService,
    private applicationRef: ApplicationRef,
    private navCtrl: NavController
  ) {
    this.moment = moment;
   }

  ngOnInit() {
    this.gender = localStorage.getItem('filter_gender') ? localStorage.getItem('filter_gender') : "Both"
    this.getUsers();
  }

  ionViewDidEnter() {
    this.getChatters();

    if (this.members.length > 0) this.getOnlineUsers();

    this.refreshIntervalId = setInterval(() => {
      this.getOnlineUsers();
    }, 8 * 1000);

    // this.refreshIntervalId = setInterval(() => {
    //   this.getUnreadMsg();
    // }, 10 * 1000);
  }

  ionViewWillLeave() {
    clearInterval(this.refreshIntervalId);
  }

  refreshNews($event) {
    setTimeout(() => {
      $event.target.complete();
    }, 1500);

    this.apiDone = false;
    this.chatters = [];

    this.last_id = 0;
    this.moreLoad = true;
    this.api_done = false;
    this.members = [];
    this.userSlide.update();

    this.getUsers();
    this.getChatters();
  }

  getUsers() {
    var sendData: any = {
      last_id: this.last_id,
      my_user_id: this.preference.currentUser.id
    }
    if (this.gender != "Both") sendData['gender'] = this.gender;

    if (this.last_id == 0) this.members = [];

    this.apiService.apiPostFunction('getusers', sendData).then(result => {
      console.log('users == ', result);
      if (result.status == 200) {
        result.data.forEach(element => {
          var country = this.preference.countries.filter(item => item.alpha3Code == element.alpha3Code);
          if (country.length > 0) element['flag_url'] = country[0].flag
          element['age'] = element.birthday ? this.comService.calculate_age(element.birthday) : ''
          if (element.id != this.preference.currentUser.id) this.members.push(element);
          this.last_id = element.id;
        });
        this.members.sort((a, b) => {
          if (a.online_status > b.online_status) return -1;
          else if (a.online_status < b.online_status) return 1;
          else return 0;
        });
        if (result.data.length > 0) {
          this.moreLoad = true;
          this.getUsers();
          this.userSlide.update();
        }
        else this.moreLoad = false;
      } else this.moreLoad = false;
      this.api_done = true;
    }).catch(error => {
      console.error(error);
      this.moreLoad = false;
      this.api_done = true;
    });
  }

  getChatters() {
    var sendData: any = {
      user_id: this.preference.currentUser.id
    }
    this.apiService.apiPostFunction('getchatters', sendData).then(result => {
      console.log('chatters == ', result);
      if (result.status == 200) {
        result.data.sort((a,b) => {
          if (new Date(a.last_msg.created_at) > new Date(b.last_msg.created_at)) return -1;
          else if (new Date(a.last_msg.created_at) < new Date(b.last_msg.created_at)) return 1;
          else return 0;
        });
        this.chatters = result.data;
        this.chatters.forEach(element => {
          var country = this.preference.countries.filter(item => item.alpha3Code == element.user_data.alpha3Code);
          if (country.length > 0) element.user_data['flag_url'] = country[0].flag
          element.user_data['age'] = element.user_data.birthday ? this.comService.calculate_age(element.user_data.birthday) : '';
          if (element.last_msg.receiver == this.preference.currentUser.id && element.last_msg.isread == 'no') element['new_msg'] = true;
          else element['new_msg'] = false;
          element.user_data.profile_img = element.user_data.profile_img.includes('http') ? element.user_data.profile_img : this.preference.image_url + element.user_data.profile_img
        })
      }
      this.apiDone = true;
      // this.getUnreadMsg();
    }).catch(error => {
      console.error(error);
      this.apiDone = true;
    })
  }

  getUnreadMsg() {
    var sendData: any = {
      user_id: this.preference.currentUser.id
    }
    this.apiService.apiPostFunction('getunreads', sendData).then(result => {
      console.log('getunreads == ', result);
      if (result.status == 200) {
        result.data.forEach(element => {
          var t_users = this.chatters.filter(item => item.id == element.id);
          if (t_users.length > 0) t_users[0].new_msg = true;
        });
        this.applicationRef.tick();
      }
    })
  }

  showMessage(user) {
    this.preference.userData = user;
    this.navCtrl.navigateForward('chat');
  }

  async changeSlide($event) {
    // var activeIndex = await this.userSlide.getActiveIndex();
    // if (activeIndex == this.members.length - 3) {
    //   if (this.moreLoad) this.getUsers();
    // }
  }

  showUser(user) {
    this.preference.userData = user;
    this.navCtrl.navigateForward('user-profile');
  }

  async follow(user) {
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
          user.isfavorite = true;
        }
        else {
          user.isfavorite = false;
        }
        this.applicationRef.tick();
      }
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader()
    })
  }

  getOnlineUsers() {
    var sendData: any = {
      my_user_id: this.preference.currentUser.id
    }
    if (this.gender != "Both") sendData['gender'] = this.gender;
    this.apiService.apiPostFunction('onlinecheck', sendData).then(result => {
      // console.log('online users == ', result);
      if (result.status == 200) {
        result.onlineUsers.forEach(element => {
          var f_users = this.members.filter(item => item.id == element.id);
          if (f_users.length > 0) f_users[0].online_status = 1;

          var t_users = this.chatters.filter(itemm => itemm.user_data.id == element.id);
          if (t_users.length > 0) t_users[0].user_data.online_status = 1;
          // var country = this.preference.countries.filter(item => item.alpha3Code == element.alpha3Code);
          // if (country.length > 0) element['flag_url'] = country[0].flag
          // element['age'] = element.birthday ? this.comService.calculate_age(element.birthday) : ''
        });

        result.offlineUsers.forEach(ele => {
          var f_users = this.members.filter(item => item.id == ele.id);
          if (f_users.length > 0) f_users[0].online_status = 0;

          var t_users = this.chatters.filter(itemm => itemm.user_data.id == ele.id);
          if (t_users.length > 0) t_users[0].user_data.online_status = 0;
        });
        this.applicationRef.tick();

        this.members.sort((a, b) => {
          if (a.online_status > b.online_status) return -1;
          else if (a.online_status < b.online_status) return 1;
          else return 0;
        });
        this.userSlide.update();
      }
    })
  }

}
