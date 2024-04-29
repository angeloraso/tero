import { Inject, Injectable } from '@angular/core';
import { ROLE } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  isAdmin() {
    return new Promise<boolean>(async resolve => {
      try {
        const roles = await this.database.getUserRoles();
        resolve(roles && roles.includes(ROLE.ADMIN));
      } catch {
        resolve(false);
      }
    });
  }
}
