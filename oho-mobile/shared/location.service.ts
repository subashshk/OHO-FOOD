import { Injectable } from '@angular/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Address } from 'src/app/models/address.model';
import { ToastService } from 'src/app/services/toast.service';
import * as geofire from 'geofire-common';
import * as _ from 'lodash';
import { DataService } from 'src/app/services/data.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { RidePreference } from '@globalEnums/ride-preference.enum';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { PlatformServices } from '@globalEnums/services.enum';
import { Geolocation } from '@capacitor/geolocation';


/// <reference types="@types/googlemaps" />
declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  watchOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
  };
  watchId: any;
  private pickupAddress: Address;

  constructor(
    private toastService: ToastService,
    private firestore: AngularFirestore,
    private dataService: DataService
  ) { }

  stopTracking = (): void => {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
    }
  };

  startTracking = (riderId: number): void => {
    this.watchId = Geolocation.watchPosition(this.watchOptions, (position) => {
      if (position) {
        this.firestore
          .collection('rider')
          .doc(riderId.toString())
          .update({
            customerPosition: new firebase.firestore.GeoPoint(
              position.coords.latitude,
              position.coords.longitude
            ),
          });
      }
    });
  };

  setCurrentLocation = (): void => {
    Geolocation.getCurrentPosition(this.watchOptions).then((position) => {
      this.saveCurrentLocation(
        position.coords.latitude,
        position.coords.longitude
      );
    });
  };

  saveCurrentLocation = (lat: number, lng: number): void => {
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
          if (results[0]) {
            const address = JSON.parse(
              JSON.stringify(
                _.mapKeys(results[0], (value, key) => _.camelCase(key))
              )
            );
            this.dataService.setPickUpAddress(address);
            this.dataService.setCurrentAddress(address);
          } else {
          }
        } else {
        }
      }
    );
  };

  turnOnGPS = (): void => {
    LocationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        LocationAccuracy.request(
          LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
        ).then(
          (res) => {
            this.getCurrentLocation();
          },
          (err) => {
            this.toastService.presentToast(
              'Please turn on your location services.',
              2000,
              'danger'
            );
          }
        );
      }
    });
  };

  getCurrentLocation = (): Promise<any> => {
    return Geolocation.getCurrentPosition()
      .then(() => {
        this.setCurrentLocation();
      })
      .catch(() => {
        this.toastService.presentToast(
          'Please enable location service',
          2000,
          'danger'
        );
      });
  };

  getAvailableRiders = (
    maxDistanceInKm: number,
    pickupAddress: Address,
    selectedVehicleTypeId?: number,
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const center = [
        pickupAddress?.geometry?.location?.lat,
        pickupAddress?.geometry?.location?.lng,
      ];
      const radiusInMeters = maxDistanceInKm * 1000;
      const bounds = geofire.geohashQueryBounds(center, radiusInMeters);
      const promises = [];
      const currentServiceType = localStorage.getItem('currentServiceType');
      const preference = currentServiceType === PlatformServices.Ride ? RidePreference.RideSharing
        : RidePreference.PackageDelivery;
      const rentalPreference = currentServiceType === PlatformServices.Rental;
      const sewaPreference = currentServiceType === PlatformServices.Sewa;
      for (const bound of bounds) {
        let query;
        if (selectedVehicleTypeId) {
          query = this.firestore.collection('rider', (ref) =>
            ref
              .where('requestId', '==', null)
              .where('vehicleTypeId', '==', selectedVehicleTypeId)
              .where('ridePreferences', 'array-contains', preference)
              .orderBy('geohash')
              .startAt(bound[0])
              .endAt(bound[1])
          );
        } else if (currentServiceType === PlatformServices.Rental) {
          // todo: rental preference might be updated in the future
          query = this.firestore.collection('rider', (ref) =>
            ref
              .where('requestId', '==', null)
              .where('rentalPreferences', '==', rentalPreference)
          );
        } else if (currentServiceType === PlatformServices.Sewa) {
          query = this.firestore.collection('rider', (ref) =>
            ref
              .where('requestId', '==', null)
              .where('sewaPreferences', '==', sewaPreference)
          );
        } else {
          query = this.firestore.collection('rider', (ref) =>
            ref
              .where('requestId', '==', null)
              .where('ridePreferences', 'array-contains', preference)
              .orderBy('geohash')
              .startAt(bound[0])
              .endAt(bound[1])
          );
        }
        promises.push(query.get().toPromise());
      }
      Promise.all(promises).then((snapshots) => {
        const riders = [];

        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const latLng = doc.get('position');
            const distanceInMeters =
              geofire.distanceBetween(
                [latLng.latitude, latLng.longitude],
                center
              ) * 1000;
            if (distanceInMeters <= radiusInMeters) {
              riders.push(doc);
            }
          }
        }
        resolve(riders);
      });
    });
  };

  public getDistance(origin: any, destination: any): Promise<any> {
    const directionsService = new google.maps.DirectionsService();
    const request = {
      origin,
      destination,
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
    }

    return new Promise((resolve, reject) => {
      directionsService.route(
        request,
        (response: google.maps.DirectionsResult, status) => {
          const leg = response.routes[0].legs[0];
          if (status === google.maps.DirectionsStatus.OK) {
            resolve({
              leg,
              distance: leg.distance.text,
              duration: leg.duration.text,
              distanceInMeters: leg.distance.value,
              durationInSeconds: leg.duration.value,
            });
          }
        });
    });
  }
}
