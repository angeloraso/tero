import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { AuthService } from '@auth/auth.service';
import { BIZY_TAG_TYPE } from '@bizy/components';
import {
  BizyCopyToClipboardService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { WHATSAPP_URL } from '@core/constants';
import { ITopic, ITopicData, TOPIC_DATA_TYPE, TOPIC_STATE } from '@core/model';
import { MobileService, TopicsService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { PATH as TOPICS_PATH } from '@dashboard/topics/topics.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { TopicDataPopupComponent } from './components';

interface IExtendedTopic extends ITopic {
  _status: string;
  _editEnabled: boolean;
  _names: Array<string>;
}

@Component({
    selector: 'tero-topics',
    templateUrl: './topics.html',
    styleUrls: ['./topics.css'],
    standalone: false
})
export class TopicsComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #topicsService = inject(TopicsService);
  readonly #auth = inject(AuthService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #mobile = inject(MobileService);
  readonly #popup = inject(BizyPopupService);
  readonly #usersService = inject(UsersService);
  readonly #copyToClipboard = inject(BizyCopyToClipboardService);

  loading = false;
  csvLoading = false;
  isNeighbor = false;
  isConfig = false;
  topics: Array<IExtendedTopic> = [];
  search: string | number = '';
  searchKeys = ['title', 'description', '_status'];
  order: 'asc' | 'desc' = 'desc';
  orderBy = 'updated';
  isMobile: boolean = this.#mobile.isMobile();
  filterStates: Array<{ id: string; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;
  accountEmail = this.#auth.getEmail();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly TOPIC_STATE = TOPIC_STATE;
  readonly TOPIC_DATA_TYPE = TOPIC_DATA_TYPE;

  async ngOnInit() {
    try {
      this.loading = true;
      const [topics, users, isConfig, isNeighbor] = await Promise.all([
        this.#topicsService.getTopics(),
        this.#usersService.getUsers(),
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor()
      ]);

      this.isConfig = isConfig;
      this.isNeighbor = isNeighbor;

      const states: Set<TOPIC_STATE> = new Set();

      this.topics = topics.map(_topic => {
        states.add(_topic.status);

        const _names: Array<string> = [];
        _topic.accountEmails.forEach(_email => {
          const user = users.find(_user => _user.email === _email);
          if (user) {
            _names.push(user.name || user.email);
          }
        });

        return {
          ..._topic,
          _names,
          _editEnabled: _topic.accountEmails.includes(this.accountEmail!),
          _status: this.#translate.get(`CORE.TOPIC_STATE.${_topic.status}`)
        };
      });

      this.filterStates = Array.from(states).map(_state => {
        return {
          id: _state,
          value: this.#translate.get(`CORE.TOPIC_STATE.${_state}`),
          selected: _state !== TOPIC_STATE.CLOSED
        };
      });
    } catch (error) {
      this.#log.error({
        fileName: 'topics.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  addTopic() {
    if (!this.isNeighbor && !this.isConfig) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}/${TOPICS_PATH.ADD}`
    });
  }

  goToTopicMilestones(topic: IExtendedTopic) {
    if (!topic || (!this.isNeighbor && !this.isConfig)) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}/${topic.id}/${TOPICS_PATH.MILESTONES}`
    });
  }

  openDataPopup(topic: IExtendedTopic) {
    if (!topic || (!this.isNeighbor && !this.isConfig)) {
      return;
    }

    this.#popup.open<{ key: string; value: string; type: TOPIC_DATA_TYPE }>(
      {
        component: TopicDataPopupComponent
      },
      async data => {
        try {
          if (data) {
            this.loading = true;
            topic.data = [...topic.data, data];
            await this.#topicsService.putTopic(topic);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'topics.component',
            functionName: 'openDataPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  editTopic(topic: IExtendedTopic) {
    if (!topic || (!this.isNeighbor && !this.isConfig) || !topic._editEnabled) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}/${topic.id}`
    });
  }

  async onCopyToClipboard(text: string) {
    try {
      if (this.loading || !text) {
        return;
      }

      await this.#copyToClipboard.copy(text);
      this.#toast.success();
    } catch (error) {
      this.#log.error({
        fileName: 'topics.component',
        functionName: 'onCopyToClipboard',
        param: error
      });
      this.#toast.danger();
    }
  }

  async onCall(tel: string) {
    try {
      if (this.loading || !tel) {
        return;
      }

      await this.#mobile.call(tel);
    } catch (error) {
      this.#log.error({
        fileName: 'topics.component',
        functionName: 'onCall',
        param: error
      });
      this.#toast.danger();
    }
  }

  onWhatsapp(tel: string) {
    if (this.loading || !tel) {
      return;
    }

    window.open(`${WHATSAPP_URL}${tel}`, '_blank');
  }

  onLink(link: string) {
    if (this.loading || !link) {
      return;
    }

    window.open(link, '_blank');
  }

  onEmail(data: ITopicData) {
    if (this.loading || !data || !data.value || !data.key) {
      return;
    }

    window.open(`mailto:${data.value}?subject=${data.key}`, '_blank');
  }

  async deleteTopicData(topic: ITopic, index: number) {
    try {
      if (this.loading || !topic || typeof index === 'undefined' || index === null) {
        return;
      }

      this.loading = true;

      topic.data.splice(index, 1);

      await this.#topicsService.putTopic(topic);
    } catch (error) {
      this.#log.error({
        fileName: 'topics.component',
        functionName: 'deleteTopicData',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  checkFilters(activated: boolean) {
    if (activated) {
      this.activatedFilters++;
    } else if (this.activatedFilters > 0) {
      this.activatedFilters--;
    }
  }

  onRemoveFilters() {
    this.search = '';
    this.filterStates.forEach(_state => {
      _state.selected = true;
    });
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.topics = [...this.topics];
  }

  goBack() {
    this.#router.goBack({ path: `/${HOME_PATH.DASHBOARD}` });
  }
}
