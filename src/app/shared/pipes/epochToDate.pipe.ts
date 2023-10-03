import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'epochToDate'
})
export class EpochToDatePipe implements PipeTransform {
  transform(epoch?: number | null): Date | null {
    if (!epoch) {
      return null;
    }

    return new Date(epoch);
  }
}
