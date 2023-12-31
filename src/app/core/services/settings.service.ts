import { Inject, Injectable } from '@angular/core';
import { ISecuritySettings } from '@core/model';
import { DatabaseService } from './database.service';

@Injectable()
export class SettingsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getSecurity() {
    return new Promise<ISecuritySettings | null>(async (resolve, reject) => {
      try {
        const settings = await this.database.getSecuritySettings();
        resolve(settings);
      } catch (error) {
        reject(error);
      }
    });
  }
}
