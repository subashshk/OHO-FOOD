import { Component, Input, OnInit } from '@angular/core';
import { Store } from 'src/app/models/store.model';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-restaurant-header',
  templateUrl: './restaurant-header.component.html',
  styleUrls: ['./restaurant-header.component.scss'],
})
export class RestaurantHeaderComponent implements OnInit {
  @Input() storeInfo: Store;
  @Input() isLoader: boolean = false;

  constructor(public utility: UtilityService) { }

  ngOnInit() {}

}
