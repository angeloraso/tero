import { Inject, NgModule } from '@angular/core';
import { TeroTranslateService } from '@core/services';
import { SharedModule } from '@shared/shared.module';
import { BarChartComponent } from './bar-chart.component';
import { es } from './i18n';

@NgModule({
  imports: [SharedModule],
  declarations: [BarChartComponent],
  exports: [BarChartComponent]
})
export class BarChartModule {
  constructor(@Inject(TeroTranslateService) private translate: TeroTranslateService) {
    this.translate.loadTranslations(es);
  }
}
