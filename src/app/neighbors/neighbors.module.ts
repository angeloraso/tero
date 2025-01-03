import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { NeighborFormComponent } from './components';
import { es } from './i18n';
import { NeighborsRoutingModule } from './neighbors.routing';

const COMPONENTS: Array<any> = [NeighborFormComponent];
@NgModule({
  imports: [SharedModule, NeighborsRoutingModule],
  declarations: NeighborsRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class NeighborsModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
