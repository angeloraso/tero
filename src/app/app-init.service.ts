import { inject, Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { ServiceWorkerService } from '@core/services';
import { initializeApp } from 'firebase/app';
import { config } from '../firebase.config';
@Injectable({ providedIn: 'root' })
export class AppInitService {
  init(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const auth = inject(AuthService)
        const serviceWorker = inject(ServiceWorkerService)
        serviceWorker.start();
        await initializeApp(config);
        await auth.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
