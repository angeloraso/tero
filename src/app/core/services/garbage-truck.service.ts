import { inject, Injectable } from '@angular/core';
import { GarbageTruckRecord, IGarbageTruckRecord } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class GarbageTruckService {
  readonly #database = inject(DatabaseService);

  getRecords() {
    return new Promise<Array<IGarbageTruckRecord>>(async (resolve, reject) => {
      try {
        const records = await this.#database.getGarbageTruckRecords();
        resolve(records ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  postRecord(data: {accountEmail: string, date: number}): Promise<void> {
    return this.#database.postGarbageTruckRecord(new GarbageTruckRecord({accountEmail: data.accountEmail, date: data.date}));
  }
}
