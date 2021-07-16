import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSlides, NavController } from '@ionic/angular';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-show-photos',
  templateUrl: './show-photos.page.html',
  styleUrls: ['./show-photos.page.scss'],
})
export class ShowPhotosPage implements OnInit {

  @ViewChild('imgSlide', { static: true }) imgSlide: IonSlides;

  photos = []
  index = 0;

  sliderConfig = {
    slidesPerView: 1,
    spaceBetween: 0
  }

  shown = false;

  isMe = false;

  constructor(
    public preference: PreferenceService,
    private router: ActivatedRoute,
    private navCtrl: NavController,
  ) {
    this.router.queryParams.subscribe(param => {
      const { ind, ...others } = param
      this.index = ind;
      if (others.isme) this.isMe = true;
    })
  }

  ngOnInit() {
    this.photos = this.preference.photos;
    this.imgSlide.slideTo(this.index);
    setTimeout(() => {
      this.shown = true;
    }, 300);
  }

  back() {
    this.navCtrl.pop();
  }

  report() {

  }

}
