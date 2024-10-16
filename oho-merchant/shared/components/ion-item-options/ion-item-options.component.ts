import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ion-item-options',
  templateUrl: './ion-item-options.component.html',
  styleUrls: ['./ion-item-options.component.scss'],
})
export class IonItemOptionsComponent implements OnInit {
  @Output() editEvent: EventEmitter<any> = new EventEmitter;
  @Output() deleteEvent: EventEmitter<any> = new EventEmitter;

  constructor() { }

  ngOnInit() {}

  public edit(): void {
    this.editEvent.emit();
  }

  public delete(): void {
    this.deleteEvent.emit();
  }

}
