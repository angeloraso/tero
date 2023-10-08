import { Injectable } from '@angular/core';
import { INeighbor } from '@core/model';

@Injectable()
export class UtilsService {
  roundNumber(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  getGroup(neighbor: INeighbor): number {
    if (!neighbor || !neighbor.lot) {
      return 0;
    }

    if (neighbor.lot > 0 && neighbor.lot <= 33) {
      return 1;
    } else if (neighbor.lot > 33 && neighbor.lot <= 71) {
      return 2;
    } else if (neighbor.lot > 71 && neighbor.lot <= 103) {
      return 3;
    } else if (neighbor.lot > 103 && neighbor.lot <= 142) {
      return 4;
    } else if (neighbor.lot > 142 && neighbor.lot <= 175) {
      return 5;
    } else if (neighbor.lot > 175 && neighbor.lot <= 215) {
      return 6;
    } else {
      return 0;
    }
  }
}
