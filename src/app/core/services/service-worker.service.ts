import { Inject, Injectable, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ENV } from '@env/environment';
import { Subscription, filter, interval, throttleTime } from 'rxjs';

enum VERSION_TYPE {
  VERSION_DETECTED = 'VERSION_DETECTED',
  VERSION_READY = 'VERSION_READY',
  VERSION_INSTALLATION_FAILED = 'VERSION_INSTALLATION_FAILED'
}

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService implements OnDestroy {
  private _subscription = new Subscription();

  constructor(@Inject(SwUpdate) private swUpdate: SwUpdate) {}

  start() {
    if (!ENV.production || ENV.mobile) {
      return;
    }

    this.checkForUpdate();
    const everyHour$ = interval(1 * 60 * 60 * 1000);
    this._subscription.add(everyHour$.subscribe(() => this.checkForUpdate()));

    this._subscription.add(
      this.swUpdate.versionUpdates
        .pipe(
          filter(event => event.type === VERSION_TYPE.VERSION_READY),
          throttleTime(60 * 1000)
        )
        .subscribe(event => {
          console.debug(event);
          window.location.reload();
        })
    );
  }

  async checkForUpdate() {
    try {
      console.debug('Checking for update...');
      const updateFound = await this.swUpdate.checkForUpdate();
      if (updateFound) {
        console.debug('A new version is available!');
      } else {
        console.debug('Already on the latest version!');
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
