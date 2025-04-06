import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BizyLogService, BizyPopupService, BizyRouterService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { ITopic, IUser, TOPIC_STATE } from '@core/model';
import { TopicsService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { TopicFormComponent } from '@dashboard/topics/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
@Component({
  selector: 'tero-edit-topic',
  templateUrl: './edit-topic.html',
  styleUrls: ['./edit-topic.css'],
  imports: [...SharedModules, TopicFormComponent]
})
export class EditTopicComponent implements OnInit {
  readonly #topicsService = inject(TopicsService);
  readonly #popup = inject(BizyPopupService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(BizyRouterService);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #translate = inject(BizyTranslateService);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);

  topic: ITopic | null = null;
  topicId: string | null = null;
  loading = false;
  users: Array<IUser> = [];

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.topicId = this.#router.getId(this.#activatedRoute, 'topicId');
      if (!this.topicId) {
        this.goBack();
        return;
      }

      const [users, topic] = await Promise.all([this.#usersService.getUsers(), this.#topicsService.getTopic(this.topicId)]);

      if (!topic) {
        this.goBack();
        return;
      }

      this.users = users;
      this.topic = topic;
    } catch (error) {
      this.#log.error({
        fileName: 'edit-topic.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteTopic = () => {
    if (!this.topic || this.loading) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('TOPICS.EDIT_TOPIC.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('TOPICS.EDIT_TOPIC.DELETE_POPUP.MSG')}: ${this.topic.title}`
        }
      },
      async res => {
        try {
          if (res && this.topic) {
            this.loading = true;
            await this.#topicsService.deleteTopic(this.topic);
            this.goBack();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-topic.component',
            functionName: 'deleteContact',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}` });
  }

  async save(topic: { title: string; description: string; status: TOPIC_STATE }) {
    try {
      if (!topic) {
        return;
      }

      this.loading = true;
      await this.#topicsService.putTopic({
        ...this.topic!,
        ...topic
      });
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'edit-topic.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
