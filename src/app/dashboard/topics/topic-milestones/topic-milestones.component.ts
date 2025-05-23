import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BIZY_TAG_TYPE, BizyLogService, BizyPopupService, BizyRouterService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { ERROR, ITopic, ITopicMilestone, TOPIC_STATE } from '@core/model';
import { MobileService, TopicsService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { TopicMilestonePopupComponent } from '@dashboard/topics/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
interface IExtendedTopic extends ITopic {
  _names: Array<string>;
  _editEnabled: boolean;
}

@Component({
  selector: 'tero-topic-milestones',
  templateUrl: './topic-milestones.html',
  styleUrls: ['./topic-milestones.css'],
  imports: SharedModules
})
export class TopicMilestonesComponent implements OnInit {
  readonly #auth = inject(AuthService);
  readonly #router = inject(BizyRouterService);
  readonly #popup = inject(BizyPopupService);
  readonly #topicsService = inject(TopicsService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #mobile = inject(MobileService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);

  topic: IExtendedTopic | null = null;
  topicId: string | null = null;
  loading = false;
  accountEmail = this.#auth.getEmail();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly TOPIC_STATE = TOPIC_STATE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.topicId = this.#router.getId(this.#activatedRoute, 'topicId');
      if (!this.topicId) {
        this.goBack();
        return;
      }

      const [topic, users] = await Promise.all([this.#topicsService.getTopic(this.topicId), this.#usersService.getUsers()]);

      if (!topic) {
        this.goBack();
        return;
      }

      const _names: Array<string> = [];
      topic.accountEmails.forEach(_email => {
        const user = users.find(_user => _user.email === _email);
        if (user) {
          _names.push(user.name || user.email);
        }
      });

      this.topic = {
        ...topic,
        _names,
        _editEnabled: topic.accountEmails.includes(this.accountEmail!)
      };
    } catch (error) {
      this.#log.error({
        fileName: 'topic-milestones.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  async openMilestonePopup(milestone?: ITopicMilestone) {
    if (this.loading || !this.topic || !this.topic._editEnabled) {
      return;
    }

    const description = milestone ? milestone.description : null;

    this.#popup.open<{ description: string }>(
      {
        component: TopicMilestonePopupComponent,
        data: {
          description
        }
      },
      async data => {
        try {
          if (data && this.topic) {
            this.loading = true;
            if (milestone) {
              await this.#topicsService.putTopicMilestone({
                topicId: this.topic.id,
                milestone: { ...milestone, description: data.description }
              });
            } else {
              await this.#topicsService.postTopicMilestone({
                topicId: this.topic.id,
                milestone: { description: data.description }
              });
              await this.#topicsService.putTopic(this.topic);
              await this.#mobile.sendPushNotification({
                topicId: this.topic.id,
                title: this.#translate.get('TOPICS.TOPIC_UPDATE_NOTIFICATION.TITLE'),
                body: `${this.#translate.get('TOPICS.TOPIC_UPDATE_NOTIFICATION.BODY')}: ${this.topic.title}`
              });
            }

            const topic = await this.#topicsService.getTopic(this.topic.id);
            this.topic = { ...this.topic, milestones: topic.milestones };
          }
        } catch (error) {
          this.#log.error({
            fileName: 'topic-milestones.component',
            functionName: 'openMilestonePopup',
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
    );
  }

  deleteTopicMilestone(milestone: ITopicMilestone) {
    if (!milestone || this.loading || !this.topic || !this.topic._editEnabled) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('TOPICS.TOPIC_MILESTONES.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('TOPICS.TOPIC_MILESTONES.DELETE_POPUP.MSG')}: ${milestone.description}`
        }
      },
      async res => {
        try {
          if (res && this.topic) {
            this.loading = true;
            await this.#topicsService.deleteTopicMilestone({ topic: this.topic, milestone });
            const topic = await this.#topicsService.getTopic(this.topic.id);
            this.topic = { ...this.topic, milestones: topic.milestones };
          }
        } catch (error) {
          this.#log.error({
            fileName: 'topic-milestones.component',
            functionName: 'deleteTopicMilestone',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}` });
  }
}
