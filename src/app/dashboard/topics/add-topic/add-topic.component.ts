import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BizyLogService, BizyRouterService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { TOPIC_SUBSCRIPTION } from '@core/constants';
import { ERROR, IUser, TOPIC_STATE } from '@core/model';
import { MobileService, TopicsService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { TopicFormComponent } from '@dashboard/topics/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
@Component({
  selector: 'tero-add-topic',
  templateUrl: './add-topic.html',
  styleUrls: ['./add-topic.css'],
  imports: [...SharedModules, TopicFormComponent]
})
export class AddTopicComponent implements OnInit {
  readonly #topicsService = inject(TopicsService);
  readonly #router = inject(BizyRouterService);
  readonly #toast = inject(BizyToastService);
  readonly #mobile = inject(MobileService);
  readonly #log = inject(BizyLogService);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);
  readonly #translate = inject(BizyTranslateService);

  loading: boolean = false;
  users: Array<IUser> = [];

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.users = await this.#usersService.getUsers();
    } catch (error) {
      this.#log.error({
        fileName: 'add-topic.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}` });
  }

  async save(topic: { title: string; description: string; accountEmails: Array<string>; status: TOPIC_STATE }) {
    try {
      if (!topic || this.loading) {
        return;
      }

      this.loading = true;

      await this.#topicsService.postTopic(topic);
      await this.#mobile.sendPushNotification({
        topicId: TOPIC_SUBSCRIPTION.NEW_TOPIC,
        title: this.#translate.get('TOPICS.NEW_TOPIC_NOTIFICATION.TITLE'),
        body: `${this.#translate.get('TOPICS.NEW_TOPIC_NOTIFICATION.BODY')}: ${topic.title}`
      });
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'add-topic.component',
        functionName: 'save',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
        return;
      }

      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
