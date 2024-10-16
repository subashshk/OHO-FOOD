import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-red-background',
  templateUrl: './red-background.component.html',
  styleUrls: ['./red-background.component.scss'],
})
export class RedBackgroundComponent implements OnInit {
  @Input() title: string;
  @Input() backIconId: string;
  @Input() hideBackIcon: boolean = false;

  @Output() backEvent: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  public back(): void {
    this.backEvent.emit();
  }
}
