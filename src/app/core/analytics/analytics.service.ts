import { Injectable, inject } from '@angular/core';
import { ENV } from '@env/environment';
import { GoogleAnalyticsService } from './google-analytics.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  readonly googleAnalytics = inject(GoogleAnalyticsService);

  start = (): Promise<void> => {
    if (!ENV.production) {
      return Promise.resolve();
    }

    return this.googleAnalytics.start();
  };

  setUserId = (userId: string) => {
    if (!ENV.production) {
      return Promise.resolve();
    }

    return this.googleAnalytics.setUserId(userId);
  };

  setUserProperty = (data: { key: string; value: string | null }) => {
    if (!ENV.production) {
      return Promise.resolve();
    }

    return this.googleAnalytics.setUserProperty(data);
  };

  logEvent = (data: { name: string; params: Record<string, unknown> }) => {
    if (!ENV.production) {
      return Promise.resolve();
    }

    return this.googleAnalytics.logEvent(data);
  };
}
