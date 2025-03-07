import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/core';
import { IUser, TOPIC_STATE } from '@core/model';
import { MobileService, TopicsService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { TopicFormComponent } from '@dashboard/topics/components';
import { PATH as HOME_PATH } from '@home/home.routing';
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

  loading: boolean = false;
  users: Array<IUser> = [];

  async ngOnInit() {
    try {
      this.loading = true;
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
    this.#router.goBack({ path: `/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}` });
  }

  async save(topic: {
    title: string;
    description: string;
    accountEmails: Array<string>;
    status: TOPIC_STATE;
  }) {
    try {
      if (!topic || this.loading) {
        return;
      }

      this.loading = true;

      await this.#topicsService.postTopic(topic);
      await this.#mobile.sendNewTopicNotification(topic.title);
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'add-topic.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
