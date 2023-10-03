import { Inject, NgModule } from '@angular/core';
import { TeroTranslateService } from '@core/services';
import { SharedModule } from '@shared/shared.module';
import { es } from './i18n';
import { LineChartComponent } from './line-chart.component';

@NgModule({
  imports: [SharedModule],
  declarations: [LineChartComponent],
  exports: [LineChartComponent]
})
export class LineChartModule {
  constructor(@Inject(TeroTranslateService) private translate: TeroTranslateService) {
    this.translate.loadTranslations(es);
  }
}
