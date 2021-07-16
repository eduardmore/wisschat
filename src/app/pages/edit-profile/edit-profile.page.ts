import { ApplicationRef, Component, OnInit } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { ActionSheetController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  userData: any;

  name
  about_me
  birthday
  phone
  address
  city

  uploadImg: any;

  constructor(
    public preference: PreferenceService,
    private apiService: ApiService,
    private comServcie: CommonService,
    private applicationRef: ApplicationRef,
    public platform: Platform,
    private actionSheetController: ActionSheetController,
    private camera: Camera
  ) { }

  ngOnInit() {
    this.userData = this.preference.currentUser
    this.name = this.userData.name
    this.about_me = this.userData.about_me
    this.birthday = this.userData.birthday
    this.phone = this.userData.phone
    this.address = this.userData.address
    this.city = this.userData.city
  }

  // picture select part
  changeImageListener($event, type = 'profile') {
    let self = this
    self.uploadImg = null;
    self.uploadImg = $event.target.files[0];

    self.uploadMedia1(type, self.uploadImg);
  }

  async choosePhotoType(type = 'profile') {
    var image_source = await this.comServcie.getTranslationWord('image_source');
    var library = await this.comServcie.getTranslationWord('library');
    var use_camera = await this.comServcie.getTranslationWord('use_camera');
    var cancel_txt = await this.comServcie.getTranslationWord('cancel');
    const actionSheet = await this.actionSheetController.create({
      header: image_source,
      buttons: [{
        text: library,
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, type);
        }
      },
      {
        text: use_camera,
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA, type);
        }
      },
      {
        text: cancel_txt,
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType, type) {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: 0,
      sourceType: sourceType,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(async (filepath) => {
      var img_data = "data:image/jpeg;base64," + filepath;
      this.uploadImg = img_data;
      this.uploadMedia(type, this.uploadImg);
    }).catch(error => {
    });
  }

  async uploadMedia(type = 'profile', file) { // from real device
    await this.comServcie.showLoader('');
    var sendData = {
      type: type,
      user_id: this.userData.id,
      file: file
    }
    this.apiService.uploadMedia(sendData, type, 'mediaupload').then(result => {
      this.comServcie.hideLoader();
      console.log('result == ', result);
      if (result.responseCode == 200) {
        var resp = JSON.parse(result.response);
        this.comServcie.showToast(resp.message);
        if (resp.status == 200) {
          this.userData.profile_img = this.preference.currentUser.profile_img = resp.url;
          localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        }
        this.applicationRef.tick()
      }
    }).catch(error => {
      this.comServcie.hideLoader();
      console.error(error);      
    })
  }

  async uploadMedia1(type = 'profile', file) {  // from browser
    await this.comServcie.showLoader('');
    var sendData = {
      type: type,
      user_id: this.userData.id,
      file: file
    }
    this.apiService.uploadMedia1('mediaupload', sendData).then(result => {
      this.comServcie.hideLoader();
      console.log('result == ', result);
      this.comServcie.showToast(result.message)
      if (result.status == 200) {
        this.userData.profile_img = this.preference.currentUser.profile_img = result.url;
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        this.applicationRef.tick()
      }
    }).catch(error => {
      this.comServcie.hideLoader();
      console.error(error);
    })
  }

  async update() {
    await this.comServcie.showLoader('');
    var sendData = {
      id: this.userData.id,
      name: this.name,
      about_me: this.about_me,
      birthday: this.birthday,
      address: this.address,
      city: this.city,
      phone: this.phone
    }
    this.apiService.apiPostFunction('updateuser', sendData).then(result => {
      this.comServcie.hideLoader();
      console.log('result == ', result);
      this.comServcie.showToast(result.message)
      if (result.status == 200) {
        this.userData = this.preference.currentUser = result.data;
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        this.applicationRef.tick();
      }
    }).catch(error => {
      console.error(error);
      this.comServcie.hideLoader();
    })
  }

}
