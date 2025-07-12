import { inject, Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { AnalyticsService } from '@core/analytics';
import { DatabaseService, ServiceWorkerService, UsersService } from '@core/services';
import { initializeApp } from 'firebase/app';
import { config } from '../firebase.config';
@Injectable({ providedIn: 'root' })
export class AppService {
  async init() {
    const serviceWorker = inject(ServiceWorkerService);
    const database = inject(DatabaseService);
    const auth = inject(AuthService);
    const analytics = inject(AnalyticsService);
    const usersService = inject(UsersService);

    serviceWorker.start();

    await initializeApp(config);
    await analytics.start();
    await database.start();
    await auth.start();

    try {
      await usersService.getCurrentUser();
    } catch {
      return Promise.resolve();
    }
  }
}
