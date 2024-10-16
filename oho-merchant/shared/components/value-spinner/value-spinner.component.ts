import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-value-spinner',
  templateUrl: './value-spinner.component.html',
  styleUrls: ['./value-spinner.component.scss'],
})
export class ValueSpinnerComponent implements OnInit {
  @Output() valueChanged = new EventEmitter<number>();

  public value: number = 0;

  constructor() { }

  ngOnInit() {}

  public add(): void {
    this.value++;
    this.valueChanged.emit(this.value);
  }

  public subtract(): void {
    this.value--;
    this.valueChanged.emit(this.value);
  }
}
