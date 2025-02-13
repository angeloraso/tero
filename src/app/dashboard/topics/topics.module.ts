import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import {
  TopicDataPopupComponent,
  TopicFormComponent,
  TopicMilestonePopupComponent
} from './components';
import { es } from './i18n';
import { TopicsRoutingModule } from './topics.routing';

const COMPONENTS: Array<any> = [
  TopicFormComponent,
  TopicMilestonePopupComponent,
  TopicDataPopupComponent
];
@NgModule({
  imports: [SharedModule, TopicsRoutingModule],
  declarations: TopicsRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class TopicsModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
