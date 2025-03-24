import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { ENV } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  start = async () => {
    if (!ENV.production) {
      Promise.resolve();
      return;
    }

    return FirebaseAnalytics.setEnabled({ enabled: true });
  };

  setUserId = async (userId: string) => FirebaseAnalytics.setUserId({ userId });

  setUserProperty = async (data: { key: string; value: string | null }) => FirebaseAnalytics.setUserProperty(data);

  logEvent = async (data: { name: string; params: Record<string, unknown> }) => {
    if (!ENV.production) {
      Promise.resolve();
      return;
    }

    return FirebaseAnalytics.logEvent(data);
  };
}
