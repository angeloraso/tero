import { Inject, Injectable } from '@angular/core';
import { INeighbor, Neighbor } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable()
export class NeighborhoodService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getNeighbors() {
    return new Promise<Array<INeighbor>>(async (resolve, reject) => {
      try {
        const history = await this.database.getNeighbors();
        if (history) {
          resolve(history as Array<INeighbor>);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  postNeighbor(neighbor: Omit<INeighbor, 'id'>): Promise<void> {
    return this.database.postNeighbor(new Neighbor(neighbor));
  }

  putNeighbor(neighbor: INeighbor): Promise<void> {
    return this.database.putNeighbor(neighbor);
  }

  deleteNeighbor(neighbor: INeighbor): Promise<void> {
    return this.database.deleteNeighbor(neighbor.id);
  }
}