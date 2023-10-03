import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
  roundNumber(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
