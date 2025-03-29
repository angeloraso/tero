import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { AnalyticsService } from '@core/analytics';

export const analyticsResolver: ResolveFn<void> = async (route: ActivatedRouteSnapshot) => {
  const analytics = inject(AnalyticsService);
  const pageViewEventName = route.data?.['pageViewEventName'];
  if (pageViewEventName) {
    await analytics.logEvent({ name: 'page_view', params: { page_path: pageViewEventName } });
  }
};
