import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent implements OnInit {

  gender = "Both"

  constructor(
    private popCtrl: PopoverController,
    public preference: PreferenceService
  ) { }

  ngOnInit() {
    this.gender = localStorage.getItem('filter_gender') ? localStorage.getItem('filter_gender') : "Both"
  }

  changeGender($event) {
    localStorage.setItem('filter_gender', this.gender);
    this.preference.filterGender = this.gender;
    if (this.gender == 'Male') this.preference.spendCoinValue = 5;
    else if (this.gender == 'Female') this.preference.spendCoinValue = 9;
    else this.preference.spendCoinValue = 0;
    this.popCtrl.dismiss(this.gender, 'selected');
  }

}
