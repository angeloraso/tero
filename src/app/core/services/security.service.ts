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

  postGroupInvoice(group: number) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.database.postSecurityGroupInvoice({ group, timestamp: Date.now() });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
