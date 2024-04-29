import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { ImageModule } from '@components/image';
import { SharedModule } from '@shared/shared.module';
import { NeighborFormComponent } from './components';
import { es } from './i18n';
import { NeighborsRoutingModule } from './neighborhood.routing';

const COMPONENTS: Array<any> = [NeighborFormComponent];
@NgModule({
  imports: [SharedModule, NeighborsRoutingModule, ImageModule],
  declarations: NeighborsRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class NeighborsModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
