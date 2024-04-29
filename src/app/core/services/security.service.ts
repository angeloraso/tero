import { Inject, Injectable } from '@angular/core';
import { ISecurity } from '@core/model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getSecurity() {
    return new Promise<ISecurity | null>(async (resolve, reject) => {
      try {
        const security = await this.database.getSecurity();
        resolve(security);
      } catch (error) {
        reject(error);
      }
    });
  }
}
