import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-gifts',
  templateUrl: './gifts.page.html',
  styleUrls: ['./gifts.page.scss'],
})
export class GiftsPage implements OnInit {

  @ViewChild("slides", {static: true}) slides!: any;

  selectedID = 0;
  selectedGift: any

  allGifts = []
  gifts1 = [];
  gifts2 = [];

  constructor(
    public preference: PreferenceService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.allGifts = this.preference.gifts;
    this.gifts1 = this.allGifts.slice(0,8);
    this.gifts2 = this.allGifts.slice(8,16);
    console.log('gifts1 == ', this.gifts1);
    console.log('gifts2 == ', this.gifts2);
  }

  ionViewDidEnter() {
    this.slides.update();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  selectGift(gift) {
    this.selectedID = gift.id;
    this.selectedGift = gift;
  }

  sendGift() {
    this.modalCtrl.dismiss({gift: this.selectedGift}, 'selected');
  }

}
