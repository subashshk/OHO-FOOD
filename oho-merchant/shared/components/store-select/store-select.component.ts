import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { plainToClass } from "class-transformer";
import { takeUntil } from "rxjs/operators";
import { Store } from "src/app/models/store.model";
import { GlobalEmitterService } from "src/app/services/global-emitter.service";
import { StoreService } from "src/app/services/store.service";
import { subscribedContainerMixin } from "../../subscribedContainer.mixin";

@Component({
  selector: "app-store-select",
  templateUrl: "./store-select.component.html",
  styleUrls: ["./store-select.component.scss"],
})
export class StoreSelectComponent
  extends subscribedContainerMixin()
  implements OnInit
{
  @Output() changeStore = new EventEmitter();

  stores: any[] = [];

  currentStoreId: string;

  constructor(
    private storeService: StoreService,
    private globalEmitterService: GlobalEmitterService
  ) {
    super();
  }

  ngOnInit() {
    this.getStores();
    this.globalEmitterService.storeChanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.currentStoreId = res;
        this.changeStore.emit(res);
      });
  }

  getStores(): void {
    this.storeService
      .getStores()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res.data.data) {
          const storeList = plainToClass(Store, res.data.data);
          storeList.forEach((element) => {
            this.stores.push({
              id: element.id.toString(),
              name: element.name,
              serviceType: element.serviceType,
              currentUserRole: element.currentUserRole,
            });
          });
          const localStore = localStorage.getItem("selectedStoreId");
          let index = 0;
          if (localStore) {
            index = storeList.findIndex((i) => i.id.toString() === localStore);
          }
          this.currentStoreId = storeList[index].id.toString();
          localStorage.removeItem("selectedStoreId");
          localStorage.setItem("selectedStoreId", this.currentStoreId);
        }
      });
  }

  setStore(store: any): void {
    localStorage.removeItem("selectedStoreId");
    localStorage.setItem("selectedStoreId", store.detail.value);
    this.currentStoreId = store.detail.value;
    this.changeStore.emit(this.currentStoreId);
    this.globalEmitterService.storeChanged.emit(this.currentStoreId);
  }
}
