import { PATH as ACCOUNT_MESSAGES_PATH } from '@account/account-messages/account-messages.routing';
import { PATH as ACCOUNT_PATH } from '@account/account.routing';
import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyLogService,
  BizyOrderByPipe,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { IAccountMessage, IUser } from '@core/model';
import { AccountMessagesService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';

interface IMessageHistory {
  user: IUser | null;
  messages: Array<IAccountMessage>;
  selected: boolean;
}

@Component({
  selector: 'tero-account-messages',
  templateUrl: './account-messages.html',
  styleUrls: ['./account-messages.css'],
  imports: SharedModules
})
export class AccountMessagesComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #home = inject(HomeService);
  readonly #orderByPipe = inject(BizyOrderByPipe);
  readonly #usersService = inject(UsersService);
  readonly #accountMessagesService = inject(AccountMessagesService);

  isNeighbor = false;
  currentUser: IUser | null = null;
  loading = false;

  search: string | number = '';
  searchKeys = ['user.name'];
  order: 'asc' | 'desc' = 'desc';
  orderBy = 'created';
  activatedFilters: number = 0;
  messageHistories: Array<IMessageHistory> = [];

  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);

      const [currentUser, messages, users, isNeighbor] = await Promise.all([
        this.#usersService.getCurrentUser(),
        this.#accountMessagesService.getMessages(),
        this.#usersService.getUsers(),
        this.#usersService.isNeighbor()
      ]);

      if (!currentUser) {
        this.goBack();
        return;
      }

      this.currentUser = currentUser;
      this.isNeighbor = isNeighbor;

      const messageHistories: Array<IMessageHistory> = [];
      messages.forEach(_message => {
        let user: IUser | null = null;

        if (_message.to.length === 1) {
          user =
            users.find(
              _user =>
                (_user.email === _message.from && _message.from !== currentUser.email) ||
                (_user.email === _message.to[0] && _message.to[0] !== currentUser.email)
            ) ?? null;
        }

        const index = messageHistories.findIndex(
          _messageHistory => _messageHistory.user !== null && user !== null && _messageHistory.user.email === user.email
        );

        if (index !== -1) {
          messageHistories[index].messages.push(_message);
        } else {
          messageHistories.push({
            user,
            messages: [_message],
            selected: false
          });
        }
      });

      this.messageHistories = messageHistories.map(_messageHistory => {
        return {
          ..._messageHistory,
          messages: this.#orderByPipe.transform(_messageHistory.messages, 'asc', 'created')
        };
      });
    } catch (error) {
      this.#log.error({
        fileName: 'account-messages.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
      throw error;
    } finally {
      this.loading = false;
    }
  }

  addAccountMessage() {
    if (this.loading || !this.isNeighbor) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}/${ACCOUNT_MESSAGES_PATH.ADD}`
    });
  }

  replyMessage(messageHistory: IMessageHistory) {
    if (this.loading || !messageHistory || !messageHistory.user) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}/${ACCOUNT_MESSAGES_PATH.ADD}`,
      params: { user: JSON.stringify(messageHistory.user) }
    });
  }

  goToMessageHistory(messageHistory: IMessageHistory) {
    if (this.loading || !this.isNeighbor || !this.currentUser || !messageHistory || !messageHistory.user) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}/${ACCOUNT_MESSAGES_PATH.MESSAGE_HISTORY}`,
      params: { email: messageHistory.user.email }
    });
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
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.messageHistories = [...this.messageHistories];
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}` });
  }
}
