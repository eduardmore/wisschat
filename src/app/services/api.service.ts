import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { NavController, Platform } from '@ionic/angular';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { PreferenceService } from './preference.service';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { CommonService } from './common.services';
import * as firebase from 'firebase';
import { GlobalEventService } from './events.service';

const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

const httpOptions = {
  headers: headers
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // base_url = 'http://127.0.0.1:8000/api';
  base_url = 'http://wisschat.com/public/api';

  constructor(
    private http: HttpClient,
    private nativeHttp: HTTP,
    private platform: Platform,
    private transfer: FileTransfer,
    private iab: InAppBrowser,
    public preference: PreferenceService,
    private facebook: Facebook,
    private google: GooglePlus,
    private comService: CommonService,
    private navCtrl: NavController,
    private eventService: GlobalEventService
  ) { }

  getCoutries() {
    return this.http.get('https://restcountries.eu/rest/v2/all')
  }

  objectToFormData(obj: any, form?: any, namespace?: any) {
    let fd: any = form || new FormData();
    let formKey: any;
    for (let property in obj) {
      if (obj.hasOwnProperty(property) && obj[property]) {
        if (namespace) {
          formKey = namespace + '[' + property + ']';
        } else {
          formKey = property;
        }
        if (obj[property] instanceof Date) {
          fd.append(formKey, obj[property].toISOString());
        }
        if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
          this.objectToFormData(obj[property], fd, formKey);
        } else {
          fd.append(formKey, obj[property]);
        }
      }
    }
    return fd;
  };

  apiGetFunction(api_name): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('hybrid')) {
        this.nativeHttp.get(`${this.base_url}/${api_name}`, {}, {}).then(result => {
          resolve(JSON.parse(result.data))
        }).catch(error => reject(error));
      } else {
        this.http.get(`${this.base_url}/${api_name}`).subscribe(result => {
          resolve(result)
        }, error => {
          reject(error)
        });
      }
    });
  }

  apiPostFunction(api_name, params): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform.is('hybrid')) {
        this.nativeHttp.setDataSerializer("json");
        this.nativeHttp.post(`${this.base_url}/${api_name}`, params, {}).then(result => {
          resolve(JSON.parse(result.data))
        }).catch(error => reject(error));
      } else {
        this.http.post(`${this.base_url}/${api_name}`, this.objectToFormData(params)).subscribe(result => {
          resolve(result)
        }, error => {
          reject(error)
        });
      }
    });
  }

  async facebookLogin() {
    this.facebook.login(['email']).then(async (response: FacebookLoginResponse) => {
      await this.loginWithFaceBook(response);
    }).catch(async (error) => {
      console.log('facebook login error == ', error);
      this.comService.showAlert(`${error.message}`);
    }).finally(async () => {
    });
  }

  private async loginWithFaceBook(res: FacebookLoginResponse) {
    const credential = firebase.default.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
    await this.comService.showLoader('')

    const fbLogin = await firebase.default.auth().signInWithCredential(credential);
    console.log('fbLogin == ', fbLogin)

    this.apiPostFunction('getfromemail', {email: fbLogin.user.email, device_token: this.preference.onesignal_token}).then(result => {
      console.log('got from == ', result);
      if (result.status == 200) {
        this.comService.hideLoader();
        this.preference.currentUser = result.data;
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        localStorage.setItem('setting', 'done');
        localStorage.setItem('fb_login', 'yes');

        if (!localStorage.getItem('permissions')) {
          this.navCtrl.navigateRoot('check-permission', {animated: true, animationDirection: 'forward'});
        } else {
          // this.webRTC.init('' + this.preference.currentUser.id);
          this.navCtrl.navigateRoot('home', {animated: true, animationDirection: 'forward'});
          this.apiPostFunction('online', {id: this.preference.currentUser.id, online_status: 1})
          .then(() => {})
          .catch(error => {});
          setTimeout(() => {
            this.eventService.publishSomeData({event: "start_webrtc"});
          }, 1500);
        }
        this.eventService.publishSomeData({event: 'logedin'});
      } else if (result.status == 401 || result.status == 402 || result.status == 403) {
        this.comService.hideLoader();
        this.comService.showToast(result.error);
        this.facebook.logout();
      } else {
        const user = {
          name: fbLogin.user.displayName,
          email: fbLogin.user.email,
          password: 'fb1234',
          device_token: this.preference.onesignal_token,
          status: 2,
          phone: fbLogin.user.phoneNumber ? fbLogin.user.phoneNumber : '',
          profile_img: fbLogin.additionalUserInfo.profile['picture'].data.url,//fbLogin.user.photoURL
        };
        this.apiPostFunction('sociallogin', user).then(result => {
          this.comService.hideLoader();
          console.log('facebook login result == ', result);
          this.comService.showToast(result.message)
          if (result.status == 200) {
            this.preference.currentUser = result.data;
            localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
            localStorage.removeItem('setting');
            localStorage.setItem('fb_login', 'yes');
            this.navCtrl.navigateRoot('settings', {animated: true, animationDirection: 'forward'});
          }
        }).catch(error => {
          console.error('social error == ', error);
          this.comService.hideLoader();
        })
      }
    }).catch(errors => {
      console.error('gotfromemail error == ', errors);
      this.comService.hideLoader();
    });
  }

  async googlePlusLogin() {
    let params;
    if (this.platform.is('android')) {
      params = {
        scopes: '',
        webClientId: '520377025072-r7p17cqgesbm2gmful9o8kgq2gbu02s7.apps.googleusercontent.com',
        offline: true
      };
    } else {
      params = {};
    }
    this.google.login(params).then(async (response) => {
      const { idToken, accessToken } = response;
      await this.loginWithGoogle(idToken, accessToken);
    }).catch(async (error) => {
      let msg = error;
      if (error instanceof Object) {
        msg = error.message;
      }
      this.comService.showAlert(msg);
      console.log('google login error == ', error);
    }).finally(async () => {
    });
  }

  private async loginWithGoogle(accessToken, accessSecret) {
    const credential = accessSecret ? firebase.default.auth.GoogleAuthProvider.credential(accessToken, accessSecret) :
      firebase.default.auth.GoogleAuthProvider.credential(accessToken);
    await this.comService.showLoader('')

    const googleResponse = await firebase.default.auth().signInWithCredential(credential);
    console.log('find googleResponse == ', googleResponse);

    this.apiPostFunction('getfromemail', {email: googleResponse.user.email, device_token: this.preference.onesignal_token}).then(result => {
      if (result.status == 200) {
        this.comService.hideLoader();
        this.preference.currentUser = result.data;
        localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
        localStorage.setItem('setting', 'done');
        localStorage.setItem('gl_login', 'yes');

        if (!localStorage.getItem('permissions')) {
          this.navCtrl.navigateRoot('check-permission', {animated: true, animationDirection: 'forward'});
        } else {
          // this.webRTC.init('' + this.preference.currentUser.id);
          this.navCtrl.navigateRoot('home', {animated: true, animationDirection: 'forward'});
          this.apiPostFunction('online', {id: this.preference.currentUser.id, online_status: 1})
          .then(() => {})
          .catch(error => {});
          setTimeout(() => {
            this.eventService.publishSomeData({event: "start_webrtc"});
          }, 1500);
        }
        this.eventService.publishSomeData({event: 'logedin'});
      } else if (result.status == 401 || result.status == 402 || result.status == 403) {
        this.comService.hideLoader();
        this.comService.showToast(result.error);
        this.google.logout();
      } else {
        const user = {
          name: googleResponse.user.displayName,
          email: googleResponse.user.email,
          password: 'google1234',
          device_token: this.preference.onesignal_token,
          status: 2,
          phone: googleResponse.user.phoneNumber ? googleResponse.user.phoneNumber : '',
          profile_img: googleResponse.user.photoURL
        };
        this.apiPostFunction('sociallogin', user).then(result => {
          this.comService.hideLoader();
          console.log('google login result == ', result);
          this.comService.showToast(result.message)
          if (result.status == 200) {
            this.preference.currentUser = result.data;
            localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
            localStorage.removeItem('setting');
            localStorage.setItem('gl_login', 'yes');
            this.navCtrl.navigateRoot('settings', {animated: true, animationDirection: 'forward'});
          }
        }).catch(error => {
          console.error(error);
          this.comService.hideLoader();
        })
      }
    }).catch(errors => {
      this.comService.hideLoader();
    });
  }

  uploadMedia(data, type, api_name): Promise<any> {
    const url = `${this.base_url}/${api_name}`;

    let request: any = {
      type: type,
      user_id: data.user_id
    }

    let options: FileUploadOptions;
    var media: any;

    const randomName = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

    if (type == 'photo' || type == 'profile') {
      options = {
        fileKey: 'file',
        chunkedMode: false,
        httpMethod: 'POST',
        fileName: randomName + '.jpg',
        params: request,
        mimeType: "image/jpeg",
        headers: {}
      };
      media = data.file
    } else {
      options = {
        fileKey: 'file',
        chunkedMode: false,
        httpMethod: 'POST',
        fileName: randomName + '.mp4',
        params: request,
        mimeType: "video/mp4",
        headers: {}
      };
      media = data.file;
    }

    const fileTransfer: FileTransferObject = this.transfer.create();

    return fileTransfer.upload(media, url, options)
  }

  uploadMedia1(api_name, params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.base_url}/${api_name}`, this.objectToFormData(params), httpOptions).subscribe(result => {
        resolve(result)
      }, error => {
        reject(error)
      });
    })
  }

  showLinkUrl(url) {
    const options: InAppBrowserOptions = {
      clearcache: "yes",
      footer: "no",
      fullscreen: "yes",
      hardwareback: "yes",
      hidespinner: "no",
      presentationstyle: "pagesheet",
      toolbar: "no",
      hidden: "yes",
      closebuttoncaption: "Close",
      hidenavigationbuttons: "yes",
      hideurlbar: "yes",
      beforeload: "yes",
      location: "yes"
    }

    const browser = this.iab.create(url, '_system', options);

    browser.on('loadstart').subscribe(event => {
    });
    browser.on('loadstop').subscribe(event => {
      browser.show();
    });
    browser.on('exit').subscribe(event => {
      browser.close();
    })
  }

  sendMediaChat(data, type, api_name): Promise<any> {
    const url = `${this.base_url}/${api_name}`;

    let request: any = {
      type: type,
      sender: data.sender,
      receiver: data.receiver
    }

    let options: FileUploadOptions;
    var media: any;

    const randomName = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

    if (type == 'image') {
      options = {
        fileKey: 'file',
        chunkedMode: false,
        httpMethod: 'POST',
        fileName: randomName + '.jpg',
        params: request,
        mimeType: "image/jpeg",
        headers: {}
      };
      media = data.file
    } else {
      options = {
        fileKey: 'file',
        chunkedMode: false,
        httpMethod: 'POST',
        fileName: randomName + '.mp3',
        params: request,
        mimeType: "audio/mp3",
        headers: {}
      };
      media = data.file;
    }

    const fileTransfer: FileTransferObject = this.transfer.create();

    return fileTransfer.upload(media, url, options)
  }

  availableCall(type = 'random'): boolean {
    if (type == 'random') {
      if (+this.preference.currentUser.coins < 61 + this.preference.spendCoinValue) {
        return false;
      } else return true;
    } else {
      if (+this.preference.currentUser.coins < 121 + this.preference.spendCoinValue) {
        return false;
      } else return true;
    }
  }

  availableChat(): boolean {
    if (this.preference.filterGender == 'Female' && this.preference.currentUser.coins < this.preference.spendCoinValue) {
      return false;
    } else if (this.preference.filterGender == 'Male' && this.preference.currentUser.coins < this.preference.spendCoinValue) {
      return false;
    } else return true;
  }
}
