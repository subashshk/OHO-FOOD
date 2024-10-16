import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as geofire from 'geofire-common';
import { Address } from '../models/address.model';
import { RidePreference } from '../shared/enums/ride-preference.enum';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  getAvailableRiders(selectedVehicleTypeId: number, maxDistanceInKm: number, pickupAddress: Address): Promise<any> {
    return new Promise((resolve, reject) => {
      const center = [pickupAddress.geometry.location.lat, pickupAddress.geometry.location.lng];
      const radiusInMeters = maxDistanceInKm * 1000;
      const bounds = geofire.geohashQueryBounds(center, radiusInMeters);
      const promises = [];
      for (const bound of bounds) {
        const query = this.firestore.collection('rider', (ref) =>
          ref
            .where('requestId', '==', null)
            .where('vehicleTypeId', '==', selectedVehicleTypeId)
            .where('ridePreferences', 'array-contains', RidePreference.OrderDelivery)
            .orderBy('geohash')
            .startAt(bound[0])
            .endAt(bound[1])
        );
        promises.push(query.get().toPromise());
      }
      Promise.all(promises).then((snapshots) => {
        const riders = [];

        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const latLng = doc.get('position');
            const distanceInMeters =
              geofire.distanceBetween([latLng.latitude, latLng.longitude], center) * 1000;
            if (distanceInMeters <= radiusInMeters) {
              riders.push(doc);
            }
          }
        }
        resolve(riders);
      });
    });
  }
}
