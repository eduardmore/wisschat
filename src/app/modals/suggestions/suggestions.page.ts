import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.page.html',
  styleUrls: ['./suggestions.page.scss'],
})
export class SuggestionsPage implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    public preference: PreferenceService
  ) { }

  ngOnInit() {
    
  }

  dismiss() {
    this.modalCtrl.dismiss()
  }

  continue() {
    this.modalCtrl.dismiss('', 'continue');
  }

}
