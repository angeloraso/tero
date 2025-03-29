import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

@Injectable({ providedIn: 'root' })
export class GoogleAnalyticsService {
  start = () => FirebaseAnalytics.setEnabled({ enabled: true });

  setUserId = (userId: string) => FirebaseAnalytics.setUserId({ userId });

  setUserProperty = (data: { key: string; value: string | null }) => FirebaseAnalytics.setUserProperty(data);

  logEvent = (data: { name: string; params: Record<string, unknown> }) => FirebaseAnalytics.logEvent(data);
}
