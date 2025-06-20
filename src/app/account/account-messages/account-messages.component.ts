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
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { IAccountMessage, IUser } from '@core/model';
import { AccountMessagesService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { USER_STATE } from './../../core/model';
import { es } from './i18n';

interface IMessageHistory {
  user: IUser | null;
  title: string;
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
  readonly #popup = inject(BizyPopupService);

  currentUser: IUser | null = null;
  loading = false;
  orderBy: 'recent' | 'oldest' | 'title' = 'recent';
  search: string | number = '';
  searchKeys = ['title'];
  activatedFilters: number = 0;
  messageHistories: Array<IMessageHistory> = [];
  users: Array<IUser> = [];

  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly USER_STATE = USER_STATE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);

      const [currentUser, messages, users] = await Promise.all([
        this.#usersService.getCurrentUser(),
        this.#accountMessagesService.getMessages(),
        this.#usersService.getUsers()
      ]);

      if (!currentUser) {
        this.goBack();
        return;
      }

      this.users = users;
      this.currentUser = currentUser;

      this.messageHistories = this.buildMessageHistories(messages);
      this.sortBy();
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

  buildMessageHistories(messages: Array<IAccountMessage>): Array<IMessageHistory> {
    try {
      const messageHistories: Array<IMessageHistory> = [];
      messages.forEach(_message => {
        let user: IUser | null = null;

        if (_message.to.length === 1) {
          user =
            this.users.find(
              _user =>
                (_user.email === _message.from && _message.from !== this.currentUser!.email) ||
                (_user.email === _message.to[0] && _message.to[0] !== this.currentUser!.email)
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
            title: user && user.name ? user.name : _message.title,
            messages: [_message],
            selected: false
          });
        }
      });

      return messageHistories.map(_messageHistory => {
        return {
          ..._messageHistory,
          messages: this.#orderByPipe.transform(_messageHistory.messages, 'asc', 'created')
        };
      });
    } catch (error) {
      this.#log.error({
        fileName: 'account-messages.component',
        functionName: 'buildMessageHistories',
        param: error
      });
      this.#toast.danger();
      throw error;
    }
  }

  addAccountMessage() {
    if (this.loading) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}/${ACCOUNT_MESSAGES_PATH.ADD}`
    });
  }

  deleteMessageHistory(messageHistory: IMessageHistory) {
    if (this.loading || !messageHistory || !this.currentUser) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('ACCOUNT_MESSAGES.DELETE_POPUP.TITLE'),
          msg:
            messageHistory.user && messageHistory.user.name
              ? `${this.#translate.get('ACCOUNT_MESSAGES.DELETE_POPUP.MSG_USER')}: ${messageHistory.user.name}`
              : `${this.#translate.get('ACCOUNT_MESSAGES.DELETE_POPUP.MSG')}: ${messageHistory.title}`
        }
      },
      async res => {
        try {
          if (res && messageHistory) {
            this.loading = true;
            const promises: Array<Promise<void>> = [];

            messageHistory.messages.forEach(_message => {
              promises.push(this.#accountMessagesService.deleteMessage(_message.id));
            });

            await Promise.all(promises);
            const messages = await this.#accountMessagesService.getMessages();
            this.messageHistories = this.buildMessageHistories(messages);
            this.sortBy();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account-message-history.component',
            functionName: 'deleteMessage',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
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
    if (this.loading || !this.currentUser || !messageHistory || !messageHistory.user) {
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

  sortBy() {
    if (this.orderBy === 'recent') {
      this.messageHistories = this.messageHistories.sort((a, b) => {
        const maxA = Math.max(...a.messages.map(_message => _message.created));
        const maxB = Math.max(...b.messages.map(_message => _message.created));
        return maxB - maxA;
      });
    } else if (this.orderBy === 'oldest') {
      this.messageHistories = this.messageHistories.sort((a, b) => {
        const maxA = Math.max(...a.messages.map(_message => _message.created));
        const maxB = Math.max(...b.messages.map(_message => _message.created));
        return maxA - maxB;
      });
    } else if (this.orderBy === 'title') {
      this.messageHistories = this.#orderByPipe.transform(this.messageHistories, 'asc', 'title');
    }
  }

  onRemoveFilters() {
    this.search = '';
    this.activatedFilters = 0;
    this.orderBy = 'recent';
    this.sortBy();
    this.refresh();
  }

  refresh() {
    this.messageHistories = [...this.messageHistories];
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}` });
  }
}
