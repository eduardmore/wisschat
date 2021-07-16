import { ApplicationRef, Component, OnInit } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { ActionSheetController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';
import { File } from '@ionic-native/file/ngx';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPE = "video/mp4";

@Component({
  selector: 'app-media-manage',
  templateUrl: './media-manage.page.html',
  styleUrls: ['./media-manage.page.scss'],
})
export class MediaManagePage implements OnInit {

  userData: any;

  uploadImg: any;
  uploadVideo: any;

  photos = []
  stories = []

  constructor(
    public preference: PreferenceService,
    private apiService: ApiService,
    private comServcie: CommonService,
    private applicationRef: ApplicationRef,
    private navCtrl: NavController,
    public platform: Platform,
    private actionSheetController: ActionSheetController,
    private camera: Camera,
    private file: File
  ) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.getUserData();
  }

  async getUserData() {
    var sendData = {
      user_id: this.preference.currentUser.id,
      my_user_id: this.preference.currentUser.id
    }
    // await this.comServcie.showLoader('')
    this.apiService.apiPostFunction('userdetail', sendData).then(result => {
      console.log('userdetail == ', result);
      // this.comServcie.hideLoader()
      if (result.status == 200) {
        this.userData = this.preference.currentUser = result.user_data
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        var country = this.preference.countries.filter(item => item.alpha3Code == this.userData.alpha3Code);
        if (country.length > 0) this.userData['flag_url'] = country[0].flag
        this.photos = result.photos;
        this.stories = result.stories
      }      
    }).catch(error => {
      console.error(error);
      // this.comServcie.hideLoader()
    })
  }

  // picture select part
  changeImageListener($event, type = 'profile') {
    let self = this
    self.uploadImg = null;
    self.uploadImg = $event.target.files[0];

    self.uploadMedia1(type, self.uploadImg);

    // var img = new Image();
    // img.onload = function (evt) {
    //   URL.revokeObjectURL('');
    //   var c = document.createElement("canvas"),
    //     ctx = c.getContext("2d");
    //   c.width = img.width;
    //   c.height = img.height;
    //   ctx.drawImage(img, 0, 0);

    //   var jpeg = c.toDataURL("image/jpeg", 0.99);  // mime=JPEG, quality=0.75
    //   self.uploadImg = jpeg
    //   self.uploadMedia1('profile', self.uploadImg);
    // };
    // img.src = URL.createObjectURL($event.target.files[0]);    
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

  //  video select part
  async changeListener($event) {
    let self = this;
    this.uploadVideo = $event.target.files[0];    
    this.uploadMedia1("story", this.uploadVideo);
  }

  async chooseVideo() {
    const options: CameraOptions = {
      mediaType: this.camera.MediaType.VIDEO,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
    }

    this.camera.getPicture(options)
      .then(async (videoUrl) => {
        if (videoUrl) {
          this.uploadVideo = null;

          var filename = videoUrl.substr(videoUrl.lastIndexOf('/') + 1);
          var dirpath = videoUrl.substr(0, videoUrl.lastIndexOf('/') + 1);

          dirpath = dirpath.includes("file://") ? dirpath : "file://" + dirpath + filename;
          console.log('dirpath == ', dirpath)

          this.uploadVideo = await this.convertVideoToBase64(dirpath);
          console.log('base 64 == ', this.uploadVideo)
          this.uploadMedia("story", this.uploadVideo);


          // try {
          //   var dirUrl = await this.file.resolveDirectoryUrl(dirpath);
          //   var retrievedFile = await this.file.getFile(dirUrl, filename, {});
          // } catch (err) {
          //   this.comServcie.showToast("Something went wrong")
          // }

          // retrievedFile.file(data => {
          //   if (data.size > MAX_FILE_SIZE) {              
          //     this.comServcie.showToast("You cannot upload more than 25mb")
          //   } else if (data.type !== ALLOWED_MIME_TYPE) {
          //     this.comServcie.showToast("Incorrect file type")
          //   } else {
          //     var videoFile = retrievedFile.nativeURL;
          //     this.uploadVideo = videoFile
          //     console.log('upload video == ', this.uploadVideo)
          //     // var convertUrl = this.webview.convertFileSrc(this.postVideo)
          //     // this.sanitizedURL = this.domSanitizer.bypassSecurityTrustResourceUrl(convertUrl);
          //     // this.applicationRef.tick()
          //     this.uploadMedia("story", this.uploadVideo);
          //   }
          // });
        }
      },
        (err) => {
          console.log(err);
        });
  }

  private async convertVideoToBase64(video) {
    return new Promise(async (resolve) => {
      let res:any = await this.file.resolveLocalFilesystemUrl(video);
      res.file((resFile) => {
        let reader = new FileReader();
        reader.readAsDataURL(resFile);
        reader.onloadend = async (evt: any) => {
          let encodingType = "data:video/mp4;base64,";
          /*
           * File reader provides us with an incorrectly encoded base64 string.
           * So we have to fix it, in order to upload it correctly.
           */
          let OriginalBase64 = evt.target.result.split(',')[1]; // Remove the "data:video..." string.
          let decodedBase64 = atob(OriginalBase64); // Decode the incorrectly encoded base64 string.
          let encodedBase64 = btoa(decodedBase64); // re-encode the base64 string (correctly).
          let newBase64 = encodingType + encodedBase64; // Add the encodingType to the string.
          resolve(newBase64);
        }
      });
    });
  }

  makeBlobVideoFile(file) {
    return new Promise((resolve, reject) => {
      try {
        console.log(file);
        const fileReader = new FileReader();
        fileReader.onloadend = (result: any) => {
          const arrayBuffer = result.target.result;
          const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'video/mp4' });
          this.uploadMedia1("story", blob);
        };
        fileReader.onerror = (error: any) => {
          reject(error);
        };
        fileReader.readAsArrayBuffer(file);
      } catch (err) {
        console.log(err);
      }
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
          if (type == 'profile') {
            this.userData.profile_img = this.preference.currentUser.profile_img = resp.url;
            localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
            this.photos.push({url: resp.url})
          } else if (type == 'photo') {
            this.photos.push({url: resp.url})
          } else {
            this.stories.push({url: resp.url})
          }
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
        if (type == 'profile') {
          this.userData.profile_img = this.preference.currentUser.profile_img = result.url;
          localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
          this.photos.push({url: result.url})
        } else if (type == 'photo') {
          this.photos.push({url: result.url})
        } else {
          this.stories.push({url: result.url})
        }
        this.applicationRef.tick()
      }
    }).catch(error => {
      this.comServcie.hideLoader();
      console.error(error);
    })
  }

  showPhotos(index) {
    this.preference.photos = this.photos;
    this.navCtrl.navigateForward('show-photos', {queryParams: {ind: index, isme: true}});
  }

  showStories(story, index) {
    this.preference.story = story;
    this.navCtrl.navigateForward('show-stories', {queryParams: {ind: index, isme: true}});
  }

}
