import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { MilestonePopupComponent, TopicFormComponent } from './components';
import { BizyEnumToArrayPipe } from './enumToArray.pipe';
import { es } from './i18n';
import { TopicsRoutingModule } from './topics.routing';

const COMPONENTS: Array<any> = [TopicFormComponent, MilestonePopupComponent];
const PIPES: Array<any> = [BizyEnumToArrayPipe];
@NgModule({
  imports: [SharedModule, TopicsRoutingModule],
  declarations: TopicsRoutingModule.COMPONENTS.concat(COMPONENTS, PIPES)
})
export class TopicsModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
