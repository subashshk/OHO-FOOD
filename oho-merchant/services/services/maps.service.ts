import { Injectable } from '@angular/core';
/// <reference types="@types/googlemaps" />

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class MapsService {

  constructor() { }

  getDirectionsResult = (startLocation: google.maps.LatLng, endLocation: google.maps.LatLng): Promise<google.maps.DirectionsResult> => {
    return new Promise((resolve, reject) => {
      const directionsService = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (response, status) => {
        if (status === 'OK') {
          resolve(response);
        } else {
          reject();
        }
      });
    });
  }
}
