import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss'],
})
export class NoDataComponent implements OnInit {
  @Input() imgPath: string = 'empty-state-generic.svg';
  @Input() title: string;
  @Input() subtitle: string;
  @Input() small: boolean;
  @Input() btnLabel: string;

  @Output() btnEvent: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  public btnClick(): void {
    this.btnEvent.emit();
  }
}
