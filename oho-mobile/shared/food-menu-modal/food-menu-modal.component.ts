import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-food-menu-modal',
  templateUrl: './food-menu-modal.component.html',
  styleUrls: ['./food-menu-modal.component.scss'],
})
export class FoodMenuModalComponent implements OnInit {
  @Input() menu: Category[];
  @Output() menuChange = new EventEmitter<Category>();

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  getCategory(category: Category) {
    this.menuChange.emit(category);
    this.modalCtrl.dismiss(category);
  }

  public dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
