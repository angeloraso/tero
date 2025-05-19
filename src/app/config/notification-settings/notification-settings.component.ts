import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BIZY_CALENDAR_DAY, BIZY_CALENDAR_MODE, BizyLogService, BizyRouterService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { TOPIC_SUBSCRIPTION } from '@core/constants';
import { ERROR, INeighbor, ITopic, IUser } from '@core/model';
import { MobileService, NeighborsService, TopicsService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';

interface IExtendedTopic extends ITopic {
  _selected: boolean;
}

@Component({
  selector: 'tero-notification-settings',
  templateUrl: './notification-settings.html',
  styleUrls: ['./notification-settings.css'],
  imports: SharedModules
})
export class NotificationSettingsComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #home = inject(HomeService);
  readonly #mobile = inject(MobileService);
  readonly #usersService = inject(UsersService);
  readonly #topicsService = inject(TopicsService);
  readonly #neighborsService = inject(NeighborsService);

  readonly BIZY_CALENDAR_MODE = BIZY_CALENDAR_MODE;
  readonly BIZY_CALENDAR_DAY = BIZY_CALENDAR_DAY;

  currentUser: IUser | null = null;
  topics: Array<IExtendedTopic> = [];
  loading = {
    main: false,
    content: false
  };

  garbageSubscriptionTopic: boolean = false;
  newTopicSubscriptionTopic: boolean = false;
  userSecurityInvoiceSubscriptionTopic: boolean = false;
  groupSecurityInvoiceSubscriptionTopic: boolean = false;
  neighbor: INeighbor | null = null;

  async ngOnInit() {
    try {
      this.loading.main = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);

      const [currentUser, topics] = await Promise.all([this.#usersService.getCurrentUser(), this.#topicsService.getTopics()]);

      if (!currentUser) {
        this.goBack();
        return;
      }

      this.neighbor = await this.#neighborsService.getNeighborByEmail(currentUser.email);

      this.topics = topics.map(_topic => {
        return { ..._topic, _selected: false };
      });

      this.currentUser = currentUser;

      if (this.currentUser.topicSubscriptions) {
        this.garbageSubscriptionTopic = this.currentUser.topicSubscriptions.includes(TOPIC_SUBSCRIPTION.GARBAGE);
        this.newTopicSubscriptionTopic = this.currentUser.topicSubscriptions.includes(TOPIC_SUBSCRIPTION.NEW_TOPIC);

        this.userSecurityInvoiceSubscriptionTopic = this.currentUser.topicSubscriptions.includes(TOPIC_SUBSCRIPTION.USER_SECURITY_INVOICE);
        this.groupSecurityInvoiceSubscriptionTopic = this.currentUser.topicSubscriptions.includes(TOPIC_SUBSCRIPTION.GROUP_SECURITY_INVOICE);

        this.topics.forEach(_topic => {
          _topic._selected = this.currentUser!.topicSubscriptions!.includes(_topic.id);
        });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
      throw error;
    } finally {
      this.loading.main = false;
    }
  }

  async subscribeToGarbageNotification() {
    try {
      if (this.loading.main || this.loading.content) {
        return;
      }

      this.loading.content = true;
      if (!this.garbageSubscriptionTopic) {
        await this.#mobile.subscribeToTopic(TOPIC_SUBSCRIPTION.GARBAGE);
        await this.#addTopicSubscription(TOPIC_SUBSCRIPTION.GARBAGE);
      } else {
        await this.#mobile.unsubscribeFromTopic(TOPIC_SUBSCRIPTION.GARBAGE);
        await this.#removeTopicSubscription(TOPIC_SUBSCRIPTION.GARBAGE);
      }
      this.garbageSubscriptionTopic = !this.garbageSubscriptionTopic;
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'subscribeToGarbageNotification',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
        return;
      } else {
        this.#toast.danger();
      }

      throw error;
    } finally {
      this.loading.content = false;
    }
  }

  async subscribeToUserSecurityInvoiceNotification() {
    try {
      if (
        this.loading.main ||
        this.loading.content ||
        !this.currentUser ||
        !this.neighbor ||
        !this.neighbor.email ||
        !this.neighbor.security ||
        !this.neighbor.group
      ) {
        return;
      }

      this.loading.content = true;
      const topicId = `${TOPIC_SUBSCRIPTION.USER_SECURITY_INVOICE}${this.neighbor.email}`;
      if (!this.userSecurityInvoiceSubscriptionTopic) {
        await this.#mobile.subscribeToTopic(topicId);
        await this.#addTopicSubscription(topicId);
      } else {
        await this.#mobile.unsubscribeFromTopic(topicId);
        await this.#removeTopicSubscription(topicId);
      }
      this.userSecurityInvoiceSubscriptionTopic = !this.userSecurityInvoiceSubscriptionTopic;
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'subscribeToUserSecurityInvoiceNotification',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
      } else {
        this.#toast.danger();
      }

      throw error;
    } finally {
      this.loading.content = false;
    }
  }

  async subscribeToGroupSecurityInvoiceNotification() {
    try {
      if (
        this.loading.main ||
        this.loading.content ||
        !this.currentUser ||
        !this.neighbor ||
        !this.neighbor.email ||
        !this.neighbor.security ||
        !this.neighbor.group
      ) {
        return;
      }

      this.loading.content = true;
      const topicId = `${TOPIC_SUBSCRIPTION.GROUP_SECURITY_INVOICE}${this.neighbor.group}`;
      if (!this.groupSecurityInvoiceSubscriptionTopic) {
        await this.#mobile.subscribeToTopic(topicId);
        await this.#addTopicSubscription(topicId);
      } else {
        await this.#mobile.unsubscribeFromTopic(topicId);
        await this.#removeTopicSubscription(topicId);
      }
      this.groupSecurityInvoiceSubscriptionTopic = !this.groupSecurityInvoiceSubscriptionTopic;
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'subscribeToGroupSecurityInvoiceNotification',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
      } else {
        this.#toast.danger();
      }

      throw error;
    } finally {
      this.loading.content = false;
    }
  }

  async subscribeToNewTopicNotification() {
    try {
      if (this.loading.main || this.loading.content) {
        return;
      }

      this.loading.content = true;
      if (!this.newTopicSubscriptionTopic) {
        await this.#mobile.subscribeToTopic(TOPIC_SUBSCRIPTION.NEW_TOPIC);
        await this.#addTopicSubscription(TOPIC_SUBSCRIPTION.NEW_TOPIC);
      } else {
        await this.#mobile.unsubscribeFromTopic(TOPIC_SUBSCRIPTION.NEW_TOPIC);
        await this.#removeTopicSubscription(TOPIC_SUBSCRIPTION.NEW_TOPIC);
      }
      this.newTopicSubscriptionTopic = !this.newTopicSubscriptionTopic;
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'subscribeToNewTopicNotification',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
      } else {
        this.#toast.danger();
      }

      throw error;
    } finally {
      this.loading.content = false;
    }
  }

  async subscribeToTopicUpdateNotification(topic: IExtendedTopic) {
    try {
      if (this.loading.main || this.loading.content) {
        return;
      }

      this.loading.content = true;
      if (!topic._selected) {
        await this.#mobile.subscribeToTopic(topic.id);
        await this.#addTopicSubscription(topic.id);
      } else {
        await this.#mobile.unsubscribeFromTopic(topic.id);
        await this.#removeTopicSubscription(topic.id);
      }
      topic._selected = !topic._selected;
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'subscribeToTopicUpdateNotification',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
      } else {
        this.#toast.danger();
      }

      throw error;
    } finally {
      this.loading.content = false;
    }
  }

  #addTopicSubscription = async (topicId: string) => {
    try {
      if (!this.currentUser) {
        return;
      }

      const topicSubscriptions = new Set(this.currentUser.topicSubscriptions ?? []);
      topicSubscriptions.add(topicId);
      await this.#usersService.putUser({ ...this.currentUser, topicSubscriptions: Array.from(topicSubscriptions) });
      this.currentUser.topicSubscriptions = Array.from(topicSubscriptions);
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: '#addTopicSubscription',
        param: error
      });
      this.#toast.danger();
      throw error;
    }
  };

  #removeTopicSubscription = async (topicId: string) => {
    try {
      if (!this.currentUser) {
        return;
      }

      const topicSubscriptions = new Set(this.currentUser.topicSubscriptions ?? []);
      topicSubscriptions.delete(topicId);
      await this.#usersService.putUser({ ...this.currentUser, topicSubscriptions: Array.from(topicSubscriptions) });
      this.currentUser.topicSubscriptions = Array.from(topicSubscriptions);
    } catch (error) {
      this.#log.error({
        fileName: 'notification-settings.component',
        functionName: 'removeTopicSubscription',
        param: error
      });
      this.#toast.danger();
      throw error;
    }
  };

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}` });
  }
}
