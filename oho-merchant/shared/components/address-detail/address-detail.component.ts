import { Component, Input, OnInit } from '@angular/core';
import { Address } from 'src/app/models/address.model';

@Component({
  selector: 'app-address-detail',
  templateUrl: './address-detail.component.html',
  styleUrls: ['./address-detail.component.scss'],
})
export class AddressDetailComponent implements OnInit {
  @Input() address: Address;

  constructor() { }

  ngOnInit() {}

}
