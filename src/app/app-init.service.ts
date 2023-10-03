import { Inject, Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { config } from '@core/firebase.config';
import { DatabaseService, ServiceWorkerService } from '@core/services';
import { initializeApp } from 'firebase/app';

@Injectable()
export class AppInitService {
  constructor(
    @Inject(DatabaseService) private database: DatabaseService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(ServiceWorkerService) private serviceWorker: ServiceWorkerService
  ) {}

  init(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.serviceWorker.start();
        const app = initializeApp(config);
        await Promise.all([this.database.start(app), this.auth.start(app)]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
