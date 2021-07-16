import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  // image_url = 'http://127.0.0.1:8000/'
  image_url = 'http://wisschat.com/public/'

  countries = []

  gifts = [];

  lat = 0;
  lng = 0;

  currentUser: any;
  userData: any;
  vcUser: any;

  photos = []
  stories = []
  story: any;

  filterGender = 'Both';
  spendCoinValue = 0;

  onesignal_token = "";

  defaultLang = "en";

  constructor() { }

  removeHtmlEntites(value: string) {
    if (!value || value == '') return '';
    var multiple = {
      '&nbsp;': ' ',
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': '\'',
      '&cent;': '¢',
      '&pound;': '£',
      '&yen;': '¥',
      '&euro;': '€',
      '&copy;': '©',
      '&reg;': '®',
      '&#160;': ' ',
      '&#60;': '<',
      '&#62;': '>',
      '&#38;': '&',
      '&#34;': '"',
      '&#39;': '\'',
      '&#162;': '¢',
      '&#163;': '£',
      '&#165;': '¥',
      '&#8364;': '€',
      '&#169;': '©',
      '&#174;': '®',

    };
    for (var char in multiple) {
      var before = char;
      var after = multiple[char];
      var pattern = new RegExp(before, 'g');
      value = value.replace(pattern, after);
    }
    return value;
  }

  calcTime(time = 0): string {
    var string_time = '';
    if (time == 0) {
      string_time = '00:00';
    } else {
      var min = Math.trunc(time / 60);
      var rest_sec = time - min * 60;
      string_time = ((min > 9) ? '' + min : '0' + min) + ':' + ((rest_sec > 9) ? rest_sec : '0' + rest_sec);
    }
    return string_time;
  }

  returnArounMinutes(time = 0): number {
    return (time % 60 == 0) ? Math.trunc(time / 60) : Math.trunc(time / 60) + 1;
  }
}
