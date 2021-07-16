import { GlobalEventService } from 'src/app/services/events.service';
import { ApplicationRef, Component, OnInit } from '@angular/core';
import { PreferenceService } from 'src/app/services/preference.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {

  userId: any
  userData: any
  stories = []
  photos = []
  favorites = []
  likes = []
  receiveFavorites = 0;
  isfavorite = false;

  refreshIntervalId: any;
  platformSubscription: any;

  constructor(
    public preference: PreferenceService,
    private apiService: ApiService,
    private comService: CommonService,
    private applicationRef: ApplicationRef,
    private webRTC: WebrtcService,
    private navCtrl: NavController,
    private platform: Platform,
    private eventService: GlobalEventService
  ) { }

  ngOnInit() {
    this.userId = this.preference.userData.id
  }

  async getUserDetail() {
    var sendData = {
      user_id: this.userId,
      my_user_id: this.preference.currentUser.id
    }
    // await this.comService.showLoader('')
    this.apiService.apiPostFunction('userdetail', sendData).then(result => {
      console.log('userdetail == ', result);
      // this.comService.hideLoader()
      if (result.status == 200) {
        this.userData = result.user_data;
        this.userData.profile_img = this.userData?.profile_img.includes('http') ? this.userData?.profile_img : this.preference.image_url + this.userData?.profile_img;
        var country = this.preference.countries.filter(item => item.alpha3Code == this.userData.alpha3Code);
        if (country.length > 0) this.userData['flag_url'] = country[0].flag;
        this.userData['age'] = this.userData.birthday ? this.comService.calculate_age(this.userData.birthday) : '';

        this.preference.userData = this.userData;

        this.stories = result.stories;
        this.photos = result.photos;
        this.favorites = result.favorites;
        this.likes = result.likes;
        this.receiveFavorites = result.receiveFavorites;
        this.isfavorite = result.isfavorite;
      }
    }).catch(error => {
      console.error(error);
      // this.comService.hideLoader()
    })
  }

  async favorite() {
    var sendData = {
      user_id: this.userId,
      my_user_id: this.preference.currentUser.id
    }
    await this.comService.showLoader('')
    this.apiService.apiPostFunction('addfavorite', sendData).then(result => {
      console.log('userdetail == ', result);
      this.comService.hideLoader()
      if (result.status == 200) {
        if (result.data == 1) {
          this.isfavorite = true;
          this.receiveFavorites++;
        }
        else {
          this.isfavorite = false;
          this.receiveFavorites--;
        }
        this.applicationRef.tick();
      }
    }).catch(error => {
      console.error(error);
      this.comService.hideLoader()
    })
  }

  async call() {
    if (this.userData.online_status != 1) {
      var can_video_online = await this.comService.getTranslationWord('can_video_online');
      this.comService.showToast(can_video_online);
      return;
    }

    if (this.preference.currentUser.user_type != 'employee' && !this.apiService.availableCall('random')) {
      var dont_have_enough_coin = await this.comService.getTranslationWord('dont_have_enough_coin');
      this.comService.showAlert(dont_have_enough_coin)
      this.navCtrl.navigateForward('coins');
      return;
    } else {
      // var need_60_min = await this.comService.getTranslationWord('need_60_min');
      // if (this.preference.currentUser.user_type != 'employee') this.comService.showToast(need_60_min);
      // this.webRTC.call('' + this.userId, 'random', this.userData.user_type);
      // this.navCtrl.navigateForward('make-call', {queryParams: {userData: this.userData}});

      var sendData = {
        my_id: this.preference.currentUser.id,
        user_id: this.userId
      }
      this.apiService.apiPostFunction('createvideocall', sendData).then(result => {
        if (result.status == 200) {
          var call_id = result.call_id;
          this.preference.vcUser = this.userData;
          this.navCtrl.navigateForward('videoroom', {queryParams: {user_id: this.userId, call_id: call_id, income: false, call_kind: 'random'}});
          this.eventService.publishSomeData({event: "vcall_started"});
        }
      }).catch(error => {
        this.comService.showToast(error.error.errors.error_text);
      })
    }
  }

  showPhotos(index) {
    this.preference.photos = this.photos;
    this.navCtrl.navigateForward('show-photos', {queryParams: {ind: index}});
  }

  showStories(story, index) {
    this.preference.story = story;
    this.navCtrl.navigateForward('show-stories', {queryParams: {ind: index}});
  }

  ionViewDidEnter() {
    this.getUserDetail();
    this.refreshIntervalId = setInterval(() => {
      this.checkUserOnlineStatus();
    }, 7 * 1000);
  }

  ionViewWillLeave() {
    clearInterval(this.refreshIntervalId);
  }

  checkUserOnlineStatus() {
    this.apiService.apiPostFunction('checkuseronlinestatus', {id: this.userData.id}).then(result => {
      if (result.status == 200) this.userData.online_status = result.online_status;
      this.applicationRef.tick();
    })
  }

  showMessage() {
    this.navCtrl.navigateForward('chat');
  }

}
