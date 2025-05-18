import { inject, Injectable } from '@angular/core';
import { INeighbor, Neighbor } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class NeighborsService {
  readonly #database = inject(DatabaseService);

  getNeighbors = () => this.#database.getNeighbors();

  getNeighbor = (neighborId: string) => this.#database.getNeighbor(neighborId);

  getNeighborByEmail = (email: string) => this.#database.getNeighborByEmail(email);

  postNeighbor = (neighbor: Omit<INeighbor, 'id' | 'created' | 'updated'>) => this.#database.postNeighbor(new Neighbor(neighbor));

  putNeighbor = (neighbor: INeighbor) =>
    this.#database.putNeighbor({
      id: neighbor.id,
      lot: neighbor.lot,
      group: neighbor.group,
      alarmNumber: neighbor.alarmNumber,
      alarmControls: neighbor.alarmControls,
      name: neighbor.name,
      surname: neighbor.surname,
      email: neighbor.email,
      security: neighbor.security,
      created: Number(neighbor.created) || Date.now(),
      updated: Date.now()
    });

  deleteNeighbor = (neighbor: INeighbor) => this.#database.deleteNeighbor(neighbor.id);
}
