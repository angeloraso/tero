import { inject, Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { DatabaseService, ServiceWorkerService } from '@core/services';
import { initializeApp } from 'firebase/app';
import { config } from '../firebase.config';
@Injectable({ providedIn: 'root' })
export class AppService {
  init(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const serviceWorker = inject(ServiceWorkerService)
        const database = inject(DatabaseService)
        const auth = inject(AuthService)

        serviceWorker.start();

        await initializeApp(config);
        await database.start();
        await auth.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
