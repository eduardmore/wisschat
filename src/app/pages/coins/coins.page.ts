import { Component, OnInit } from '@angular/core';
import { InAppPurchase } from '@ionic-native/in-app-purchase/ngx';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.services';
import { PreferenceService } from 'src/app/services/preference.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.page.html',
  styleUrls: ['./coins.page.scss'],
})
export class CoinsPage implements OnInit {  

  iapProducts = [];
  products = [];
  api_done = false;

  constructor(
    private iap: InAppPurchase,
    public preference: PreferenceService,
    private comService: CommonService,
    private navCtrl: NavController,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.getIapProducts();
  }

  async getIapProducts() {
    this.apiService.apiGetFunction('getproducts').then(result => {
      console.log('iapProducts from db == ', result)      
      if (result.status == 200) {
        this.iapProducts = result.data;
        var prodIds = []
        this.iapProducts.forEach(ele => {
          prodIds.push(ele.prod_id);          
        });
        if (prodIds.length > 0) this.getPurchases(prodIds);
        else this.api_done = true
      }
    }).catch(error => {
      console.error(error);
      this.api_done = true
    });
  }

  getPurchases(prod = []) {
    this.iap.getProducts(prod)
    .then((products) => {
      this.api_done = true
      console.log('products == ', products);
      products.forEach(element => {
        var prods = this.iapProducts.filter(item => item.prod_id == element.productId);
        if (prods.length > 0) {
          element['coins'] = prods[0].coins;
        }
      });
      this.products = products;
      //  [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
    })
    .catch((err) => {
      this.api_done = true
      console.log(err);
    });
  }

  async buyCoins(item) {
    this.iap.subscribe(item.productId).then(async (data) => {
      console.log('buy == ', data);
      if (data.transactionId && data.transactionId != '') {
        this.apiService.apiPostFunction('addcoin', {
          user_id: this.preference.currentUser.id,
          coins: item.coins
        }).then(resp => {
          this.comService.showToast(resp.message)
          if (resp.status == 200) {
            this.preference.currentUser.coins = resp.data;
            localStorage.setItem('w_user', JSON.stringify(this.preference.currentUser));
            this.navCtrl.pop();
          }
        }).catch(error => console.error(error));
      }
    })
  }

}
