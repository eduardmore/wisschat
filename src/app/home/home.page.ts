import { ApplicationRef, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonInfiniteScroll, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { CategoryItemComponent } from '../components/category-item/category-item.component';
import { SuggestionsPage } from '../modals/suggestions/suggestions.page';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.services';
import { GlobalEventService } from '../services/events.service';
import { PreferenceService } from '../services/preference.service';
import { WebrtcService } from '../services/webrtc.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild(IonInfiniteScroll, {static: true}) initial: IonInfiniteScroll

  last_id = 0;
  gender = "Both";

  users = []

  subscription: any;
  checkOnlineStatus = true;

  refreshIntervalId: any;

  api_done = false;

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private apiService: ApiService,
    public preference: PreferenceService,
    private comService: CommonService,
    private popCtrl: PopoverController,
    private platform: Platform,
    private alertController: AlertController,
    private applicationRef: ApplicationRef,
    private eventService: GlobalEventService,
    private webRTC: WebrtcService
  ) {
    this.eventService.getObservable().subscribe(data => {
      if (data.event == 'start_webrtc') {
        // this.webRTC.init('' + this.preference.currentUser.id);
      }
    })
  }

  ngOnInit() {
    this.gender = localStorage.getItem('filter_gender') ? localStorage.getItem('filter_gender') : "Both"
    this.getUsers();
    console.log('c_user == ', this.preference.currentUser);
  }

  async showSuggestion() {
    // var modal = await this.modalCtrl.create({
    //   component: SuggestionsPage,
    //   backdropDismiss: false,
    //   cssClass: 'suggestion'
    // });
    // modal.onDidDismiss().then(data => {
    //   if (data.role && data.role != '') {
    //     this.navCtrl.navigateForward('coins');
    //   }
    // });
    // modal.present();
  }

  call() {
    // this.navCtrl.navigateForward('random-vcall');
    this.navCtrl.navigateForward('search-online');
  }

  getUsers() {
    var sendData: any = {
      last_id: this.last_id,
      my_user_id: this.preference.currentUser.id
    }
    if (this.gender != "Both") sendData['gender'] = this.gender;

    if (this.last_id == 0) this.users = [];

    this.apiService.apiPostFunction('getusers', sendData).then(result => {
      console.log('users == ', result);
      // this.initial.complete()
      this.api_done = true
      if (result.status == 200) {
        result.data.forEach(element => {
          var country = this.preference.countries.filter(item => item.alpha3Code == element.alpha3Code);
          if (country.length > 0) element['flag_url'] = country[0].flag
          element['age'] = element.birthday ? this.comService.calculate_age(element.birthday) : ''
          if (element.id != this.preference.currentUser.id) this.users.push(element);
          this.last_id = element.id;
        });
        // if (result.data.length == 0) this.initial.disabled = true
        // else this.initial.disabled = false
      }
    }).catch(error => {
      console.error(error);
      // this.initial.disabled = true
    });
  }

  showDetail(user) {
    this.preference.userData = user;
    this.navCtrl.navigateForward('user-profile');
  }

  loadMoreData($event) {
    this.getUsers()
  }

  async selectGender($event) {
    var pop = await this.popCtrl.create({
      component: CategoryItemComponent,
      event: $event
    });
    pop.onDidDismiss().then(data => {
      if (data.role == 'selected') {
        this.gender = data.data;
        this.last_id = 0;
        this.api_done = false;
        this.getUsers();
      }
    });
    pop.present()
  }

  getOnlineUsers() {
    if (!this.checkOnlineStatus) return;

    var sendData: any = {
      my_user_id: this.preference.currentUser.id
    }
    if (this.gender != "Both") sendData['gender'] = this.gender;
    this.apiService.apiPostFunction('onlinecheck', sendData).then(result => {
      console.log('online users == ', result);

      if (result.status == 200) {
        result.onlineUsers.forEach(element => {
          var f_users = this.users.filter(item => item.id == element.id);
          if (f_users.length > 0) f_users[0].online_status = 1;

          var country = this.preference.countries.filter(item => item.alpha3Code == element.alpha3Code);
          if (country.length > 0) element['flag_url'] = country[0].flag
          element['age'] = element.birthday ? this.comService.calculate_age(element.birthday) : ''
        });

        result.offlineUsers.forEach(ele => {
          var f_users = this.users.filter(item => item.id == ele.id);
          if (f_users.length > 0) f_users[0].online_status = 0;
        });
        this.applicationRef.tick();
      }
    })
  }

  getUnreadMsg() {
    var sendData: any = {
      user_id: this.preference.currentUser.id
    }
    this.apiService.apiPostFunction('getunreads', sendData).then(result => {
      // console.log('unreads == ', result);
      if (result.status == 200) {
        if (result.data.length > 0) this.eventService.publishSomeData({event: 'new_msg', count: result.data.length})
      }
    })
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(() => {
      this.presentAlertConfirm();
    });

    this.checkOnlineStatus = true;
    this.getUnreadMsg();
    // this.getOnlineUsers();

    this.refreshIntervalId = setInterval(() => {
      // this.getOnlineUsers();
      this.getUnreadMsg();
    }, 8 * 1000)
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
    this.checkOnlineStatus = false;
    clearInterval(this.refreshIntervalId);
  }

  async presentAlertConfirm() {
    var exit_app = await this.comService.getTranslationWord('exit_app');
    var are_you_sure_close = await this.comService.getTranslationWord('are_you_sure_close');
    var cancel_txt = await this.comService.getTranslationWord('cancel');
    var yes_txt = await this.comService.getTranslationWord('yes');
    const alert = await this.alertController.create({
      header: exit_app,
      message: are_you_sure_close,
      buttons: [
        {
          text: cancel_txt,
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: yes_txt,
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present();
  }

}
