import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Shipment } from 'src/app/models/shipment.model';
import { User } from 'src/app/models/user.model';
import { VehicleType } from 'src/app/models/vehicle-type.model';
import { environment } from 'src/environments/environment';
import { GoogleMapsComponent } from '../google-maps/google-maps.component';

@Component({
  selector: 'app-map-view-modal',
  templateUrl: './map-view-modal.component.html',
  styleUrls: ['./map-view-modal.component.scss'],
})
export class MapViewModalComponent implements OnInit {
  @ViewChild(GoogleMapsComponent, { static: false }) mapsComponent: GoogleMapsComponent;

  @Input() storeAddress: any;
  @Input() shipAddress: any;
  @Input() showDirection: boolean;
  @Input() rider: User;
  @Input() status: string;
  @Input() deliveryId: number;
  @Input() showDropOffMarker = true;
  @Input() showVehicleSelector = false;
  @Input() order: Shipment;
  @Input() routeDistanceInKm: number;
  @Input() selectLocation: boolean = false;
  @Input() placeId: any;

  apiKey = environment.googleMapsApiKey;
  distanceInKm: number;
  visibleRiders = [];
  selectedVehicleType: VehicleType;
  public isDragging: boolean = false;
  public location: any;
  public inputFocused: boolean = false;
  public autoCompleteLocation: any[] = [];
  public searchText: string;

  constructor(private modalController: ModalController, @Inject(DOCUMENT) private document) { }

  ngOnInit() { }

  closeModal(assignComplete = false): void {
    if (this.document.body.children.googleMaps) {
      this.document.body.removeChild(this.document.body.children.googleMaps);
      this.removeGoogleMapScript();
    }

    this.modalController.dismiss({
      assignComplete
    });
  }

  removeGoogleMapScript(): void {
    let keywords = ['maps.googleapis'];

    //Remove google from BOM (window object)
    window['google'] = undefined;

    //Remove google map scripts from DOM
    let scripts = document.head.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      let scriptSource = scripts[i].getAttribute('src');
      if (scriptSource != null) {
        if (keywords.filter((item) => scriptSource.includes(item)).length) {
          scripts[i].remove();
          // scripts[i].parentNode.removeChild(scripts[i]);
        }
      }
    }
  }

  selectVehicleType = (vehicleType: VehicleType): void => {
    this.selectedVehicleType = vehicleType;
  }

  showAvailableRiders = (availableRiderDocs): void => {
    this.visibleRiders = [];
    this.mapsComponent.removeRiderMarkers();
    availableRiderDocs.forEach((riderDoc) => {
      this.visibleRiders.push(riderDoc);
      this.mapsComponent.setRiderMarker(
        riderDoc.get('position'),
        this.selectedVehicleType.mapIconMini
      );
    });
  }

  setDistanceInKm = (distanceInM: number): void => {
    this.distanceInKm = distanceInM / 1000;
  }

  public setMarker(isDragging: boolean): void {
    this.isDragging = isDragging;
    if (this.isDragging) {
      this.location = null;
    }
  }

  public getLocation($event: any): void {
    this.location = $event;
  }

  public saveLocation(): void {
    this.modalController.dismiss({ location: this.location });
  }

  public initService($event: any): void {
    let newPred = [];

    const displaySuggestions = (
      predictions: google.maps.places.AutocompletePrediction[] | null,
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status != google.maps.places.PlacesServiceStatus.OK || !predictions)
        return;

      predictions.forEach((prediction) => {
        newPred.push(prediction);
      });

      this.autoCompleteLocation = newPred;
    }
    const options = {
      input: $event.target.value,
      componentRestrictions: { country: 'np' },
    }
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      options,
      displaySuggestions
    );
  }

  public onFocus(): void {
    this.inputFocused = true;
    this.autoCompleteLocation = [];
  }

  public searchClick(address: any): void {
    this.searchText = address?.description.toString().replace(", Nepal", "");
    this.inputFocused = false;
    this.autoCompleteLocation = [];
    this.mapsComponent.panMapToPlaceId(address.placeId ?? address.place_id);
  }

  public panToCurrentLocation(): void {
    this.mapsComponent.panToCurrentLocation();
    this.searchText = '';
  }
}
