import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removePlusCode'
})
export class RemovePlusCodePipe implements PipeTransform {

  transform(address: any): string {
    const addressComponents = address?.address_components ?? address?.addressComponents;
    const streetCode = addressComponents?.filter((component: any) => component.types.includes('plus_code'))
    const formattedAddress = address?.formatted_address ?? address?.formattedAddress;
    const newAddressFormat = formattedAddress?.replace(streetCode[0]?.long_name ?? streetCode[0]?.longName, '');

    if (newAddressFormat?.startsWith(', ' || ',')) {
      return newAddressFormat?.slice(1);
    }
    return newAddressFormat;
  }

}
