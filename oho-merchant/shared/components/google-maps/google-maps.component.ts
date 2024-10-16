import { ToastService } from './../../../services/toast.service';
import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  Inject,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { takeUntil } from 'rxjs/operators';
import { subscribedContainerMixin } from '../../subscribedContainer.mixin';
import { environment } from 'src/environments/environment';
import { MarkerImage } from '../../enums/marker-image.enum';
import { Address } from 'src/app/models/address.model';
/// <reference types="@types/googlemaps" />
declare const google: any;

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent extends subscribedContainerMixin() implements OnInit {
  @Input() apiKey: string;
  @Input() shipAddress: any;
  @Input() storeAddress: any;
  @Input() showDirection: boolean;
  @Input() deliveryId: number;
  @Input() showDropOffMarker = true;
  @Input() placeId: any;

  @Output() locationEmitter = new EventEmitter();
  @Output() distanceInMetersEmitter = new EventEmitter();
  @Output() dragEmitter: EventEmitter<any> = new EventEmitter();

  private map: any;
  public markers: any[] = [];
  private mapsLoaded: boolean = false;
  private networkHandler = null;

  public directionMarkers: google.maps.Marker[] = [];
  activeRider: Observable<any[]>;
  riderLocationMarkers: google.maps.Marker[] = [];
  private infoWindow: google.maps.InfoWindow;
  private defaultZoom: number = 16;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    @Inject(DOCUMENT) private _document,
    private toastService: ToastService,
    private firestore: AngularFirestore
  ) {
    super();
  }

  get marker(): any {
    return this.markers[0];
  }

  ngOnInit() {
    this.init().then(
      (res) => {
        console.log('Google Maps ready.');
      },
      (err) => {
        this.toastService.presentToast(err, 2000, 'danger');
      }
    );
  }

  public getRiderLocation(): void {
    this.activeRider = this.firestore
      .collection('rider', (ref) => ref.where('requestId', '==', this.deliveryId))
      .valueChanges();
    this.activeRider.pipe(takeUntil(this.destroyed$)).subscribe(
      (res) => {
        if (res.length > 0) {
          this.markers.forEach((marker) => {
            marker.setMap(null);
          });
          this.markers = [];
          const image = {
            url: 'http://oho.bajratechnologies.com/assets/images/bike-top-view.svg',
            scaledSize: new google.maps.Size(20, 50),
          };

          const marker = new google.maps.Marker({
            position: {
              lat: res[0].position.latitude,
              lng: res[0].position.longitude,
            },
            map: this.map,
            icon: image,
          });
          this.markers.push(marker);
        } else {
          this.markers.forEach((marker) => {
            marker.setMap(null);
          });
        }
      },
      (err) => { }
    );
  }

  private init(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadSDK().then(
        (res) => {
          this.initMap();
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  private loadSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mapsLoaded) {
        Network.getStatus().then(
          (status) => {
            if (status.connected) {
              this.injectSDK().then(
                (res) => {
                  resolve(true);
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              if (this.networkHandler === null) {
                this.networkHandler = Network.addListener('networkStatusChange', (status) => {
                  if (status.connected) {
                    this.networkHandler.remove();
                    this.init();
                  }
                });
              }
            }
          },
          (err) => {
            if (navigator.onLine) {
              this.injectSDK().then(
                (res) => {
                  resolve(true);
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              reject('Not online 1');
            }
          }
        );
      } else {
        reject('SDK already loaded');
      }
    });
  }

  private injectSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      window['mapInit'] = () => {
        this.mapsLoaded = true;
        resolve(true);
      };

      const script = this.renderer.createElement('script');
      script.id = 'googleMaps';

      if (this.apiKey) {
        script.src =
          'https://maps.googleapis.com/maps/api/js?key=' +
          this.apiKey +
          '&callback=mapInit&libraries=places';
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
      }
      this.renderer.appendChild(this._document.body, script);
    });
  }

  private initMap(): void {
    if (this.showDirection) {
      this.createMapWithCurrentLocation(true);
    } else {
      if (this.shipAddress) {
        this.createMapWithCurrentLocation();
      } else {
        this.createMap({ lat: 27.70758815866043, lng: 85.32235552303936 });
      }
    }
  }

  createMapWithCurrentLocation(direction = false): void {
    const infoWindow = new google.maps.InfoWindow();

    const latLng = this.shipAddress.geometry.location;
    // this.locationEmitter.emit(results[0]);
    infoWindow.setContent(this.shipAddress.formatted_address);

    this.createMap(latLng, true, direction);
  }

  createMap(latLng, addMarker = false, direction = false): void {
    const mapLatLng = new google.maps.LatLng(latLng.lat, latLng.lng);
    const mapOptions = {
      center: mapLatLng,
      zoom: 15,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: false
    };
    this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
    this.addDragEventListenersToMap(this.map);
    if (this.placeId) {
      this.panMapToPlaceId(this.placeId);
    } else {
      this.panToCurrentLocation();
    }

    if (addMarker && this.showDropOffMarker) {
      const marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
      });
      this.markers.push(marker);
    }

    if (direction) {
      this.createDirectionMap().then((res) => {
        this.addDirectionsMarker(res.leg);
        this.distanceInMetersEmitter.emit(res.distanceInMeters);
        this.getRiderLocation();
      });
    }
  }

  createDirectionMap(): Promise<any> {
    let directionsService = new google.maps.DirectionsService();
    let directionsRenderer = new google.maps.DirectionsRenderer(
      {
        suppressMarkers: true
      }
    );

    directionsRenderer.setMap(this.map);

    let start = this.storeAddress.geometry.location;
    let end = this.shipAddress.geometry.location;

    let request = {
      origin: start,
      destination: end,
      travelMode: 'DRIVING',
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, function (response, status) {
        if (status == 'OK') {
          directionsRenderer.setDirections(response);
          resolve({
            leg: response.routes[0].legs[0],
            distance: response.routes[0].legs[0].distance.text,
            duration: response.routes[0].legs[0].duration.text,
            distanceInMeters: response.routes[0].legs[0].distance.value,
            durationInSeconds: response.routes[0].legs[0].duration.value
          });
        }
      });
    })

  }

  addDirectionsMarker = (leg: google.maps.DirectionsLeg): void => {
    const directionIcons = {
      start: environment.markersRootUrl + MarkerImage.PickupMarker,
      end: environment.markersRootUrl + MarkerImage.DestinationMarker
    }
    this.addDirectionMarkerInMap(leg.start_location, directionIcons.start);
    this.addDirectionMarkerInMap(leg.end_location, directionIcons.end);
  }

  addDirectionMarkerInMap = (position: google.maps.LatLng, imageUrl: string): void => {
    const image = {
      url: imageUrl,
      scaledSize: new google.maps.Size(50, 50)
    };
    this.directionMarkers.push(new google.maps.Marker({
      position,
      map: this.map,
      icon: image
    }));
  }
  removeRiderMarkers = (): void => {
    this.riderLocationMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    this.riderLocationMarkers = [];
  }

  setRiderMarker = (position, imageUrl: string): void => {
    const image = {
      url: imageUrl,
      scaledSize: new google.maps.Size(50, 50),
    };
    const marker = new google.maps.Marker({
      position: {
        lat: position.latitude,
        lng: position.longitude
      },
      map: this.map,
      icon: image
    });
    this.riderLocationMarkers.push(marker);
  }

  public panToCurrentLocation = (): void => {
    Geolocation.getCurrentPosition().then((position) => {
      const latLng = new google.maps.LatLng(
        position?.coords?.latitude,
        position?.coords?.longitude
      );
      this.reverseGeocode(position?.coords?.latitude, position?.coords?.longitude);
      this.map.panTo(latLng);
      this.map.setZoom(this.defaultZoom);
    });
  };

  public addDragEventListenersToMap(map: any): void {
    map.addListener('dragstart', () => {
      this.dragEmitter.emit(true);
      if (this.infoWindow) {
        this.infoWindow.close();
      }
    });

    map.addListener('dragend', () => {
      this.dragEmitter.emit(false);
      this.reverseGeocode(map.getCenter().lat(), map.getCenter().lng());
    });
  }

  public reverseGeocode(lat: number, lng: number): void {
    const latlng = {
      lat,
      lng,
    };
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        location: latlng,
      },
      (
        results: google.maps.GeocoderResult[],
        status: google.maps.GeocoderStatus
      ) => {
        if (status === 'OK') {
          if (results.length > 0) {
            // set nearest POI if Unnamed Road
            const result = results[0];
            if (result.address_components[0].short_name === 'Unnamed Road') {
              this.setNearestPOIasFormattedAddress(lat, lng, result);
            } else {
              this.locationEmitter.emit(result);
            }
          }
        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          setTimeout(() => {
            this.reverseGeocode(lat, lng);
          }, 2000);
        } else {
        }
      }
    );
  }

  public setNearestPOIasFormattedAddress = (
    lat: number,
    lng: number,
    address: Address
  ): void => {
    const service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(
      {
        location: new google.maps.LatLng(lat, lng),
        radius: 100,
        type: 'point_of_interest',
      },
      (res, status: string) => {
        if (status === 'OK') {
          if (res.length > 0) {
            address.formattedAddress = res[0].name;
            this.locationEmitter.emit(address);
          }
        }
      }
    );
  };

  public panMapToPlaceId(placeId: any): Promise<any> {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { placeId },
        (
          results: google.maps.GeocoderResult[],
          status: google.maps.GeocoderStatus
        ) => {
          if (status === 'OK') {
            if (results[0]) {
              const latLng = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              };
              this.map.panTo(latLng);
              this.locationEmitter.emit(results[0]);
              console.log('results', results[0]);
              resolve(true);
            } else {
              reject('No results found');
            }
          } else {
            reject('Geocoder failed due to: ' + status);
          }
        }
      )
    })
  }
}
