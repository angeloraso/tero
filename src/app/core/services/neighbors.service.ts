import { Inject, Injectable } from '@angular/core';
import { INeighbor, Neighbor } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class NeighborsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getNeighbors() {
    return new Promise<Array<INeighbor>>(async (resolve, reject) => {
      try {
        const neighbors = await this.database.getNeighbors();
        resolve(neighbors ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  getNeighbor(neighborId: string) {
    return new Promise<INeighbor>(async (resolve, reject) => {
      try {
        const neighbor = await this.database.getNeighbor(neighborId);
        if (neighbor) {
          resolve(neighbor);
        } else {
          throw new Error('Not exists');
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
    return this.database.putNeighbor({
      id: neighbor.id,
      lot: neighbor.lot,
      group: neighbor.group,
      name: neighbor.name,
      surname: neighbor.surname,
      security: neighbor.security,
      picture: neighbor.picture,
      phones: neighbor.phones,
      created: Number(neighbor.created) || Date.now(),
      updated: Date.now()
    });
  }

  deleteNeighbor(neighbor: INeighbor): Promise<void> {
    return this.database.deleteNeighbor(neighbor.id);
  }
}
