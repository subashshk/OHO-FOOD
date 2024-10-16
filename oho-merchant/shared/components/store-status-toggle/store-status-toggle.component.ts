import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-store-status-toggle',
  templateUrl: './store-status-toggle.component.html',
  styleUrls: ['./store-status-toggle.component.scss'],
})
export class StoreStatusToggleComponent implements OnInit {
  public isLoading = false;

  constructor() {}

  ngOnInit() {}
}
