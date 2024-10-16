import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ion-segment',
  templateUrl: './ion-segment.component.html',
  styleUrls: ['./ion-segment.component.scss'],
})
export class IonSegmentComponent implements OnInit {

  @Input() value: any[];
  @Input() segmentValue: any;

  @Output() onChangeEvent: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  public changeEvent($event): void {
    this.onChangeEvent.emit($event);
  }

}
