import { Component, OnInit } from '@angular/core';
import { GlobalEmitterService } from 'src/app/shared/services/global-emitter.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(
    private globalEmitter: GlobalEmitterService
  ) { }

  ngOnInit(): void {
    this.globalEmitter.moduleLoader.emit(false);
  }

}
