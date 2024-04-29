import { Inject, Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { ServiceWorkerService } from '@core/services';
import { initializeApp } from 'firebase/app';
import { config } from '../firebase.config';
@Injectable()
export class AppInitService {
  constructor(
    @Inject(AuthService) private auth: AuthService,
    @Inject(ServiceWorkerService) private serviceWorker: ServiceWorkerService
  ) {}

  init(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.serviceWorker.start();
        await initializeApp(config);
        await this.auth.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
