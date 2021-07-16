import { ApplicationRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-show-stories',
  templateUrl: './show-stories.page.html',
  styleUrls: ['./show-stories.page.scss'],
})
export class ShowStoriesPage implements OnInit {

  index = 0;
  story: any;

  isMe = false;

  constructor(
    public preference: PreferenceService,
    private router: ActivatedRoute,
    private navCtrl: NavController,
    private applicationRef: ApplicationRef
  ) { 
    this.router.queryParams.subscribe(param => {
      const { ind, ...others } = param
      this.index = ind;
      if (others.isme) this.isMe = true;
    })
  }

  ngOnInit() {
    this.story = this.preference.story
    setTimeout(() => {
      this.applicationRef.tick();
    }, 1000);
  }

  back() {
    this.navCtrl.pop();
  }

  report() {

  }

}
