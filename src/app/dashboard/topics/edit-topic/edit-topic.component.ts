import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BIZY_TAG_TYPE,
  BizyFormComponent,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { AuthService } from '@core/auth/auth.service';
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { ERROR, ITopic, IUser, TOPIC_STATE } from '@core/model';
import { TopicsService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { TopicStatesPopupComponent, TopicUsersPopupComponent } from '@dashboard/topics/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
@Component({
  selector: 'tero-edit-topic',
  templateUrl: './edit-topic.html',
  styleUrls: ['./edit-topic.css'],
  imports: SharedModules
})
export class EditTopicComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #topicsService = inject(TopicsService);
  readonly #usersService = inject(UsersService);
  readonly #router = inject(BizyRouterService);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #translate = inject(BizyTranslateService);
  readonly #fb = inject(FormBuilder);
  readonly #popup = inject(BizyPopupService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #auth = inject(AuthService);

  loading: boolean = false;
  topic: ITopic | null = null;
  topicId: string | null = null;
  accountEmail = this.#auth.getEmail()!;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly DESCRIPTION_LENGTH = 1024;

  readonly #form = this.#fb.group({
    title: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH), Validators.required]],
    status: [TOPIC_STATE.ACTIVE, [Validators.required]],
    users: [null]
  });

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

      this.topic = topic;

      if (this.topic.title) {
        this.title.setValue(this.topic.title);
      }

      if (this.topic.description) {
        this.description.setValue(this.topic.description);
      }

      if (this.topic.status) {
        this.status.setValue(this.topic.status);
      }

      if (this.topic.accountEmails) {
        const _users: Array<IUser> = [];
        this.topic.accountEmails.forEach(_email => {
          const user = users.find(_user => _user.email === _email);
          if (user && user.email !== this.accountEmail) {
            _users.push(user);
          }
        });
        this.users.setValue(
          _users.map(_user => {
            return {
              email: _user.email,
              name: _user.name || _user.email
            };
          })
        );
      }
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

  get title() {
    return this.#form.get('title') as FormControl;
  }

  get description() {
    return this.#form.get('description') as FormControl;
  }

  get status() {
    return this.#form.get('status') as FormControl<TOPIC_STATE>;
  }

  get users() {
    return this.#form.get('users') as FormControl;
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.TOPICS}` });
  }

  openUsersPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<Array<{ name: string; email: string }>>(
      {
        component: TopicUsersPopupComponent,
        fullScreen: true,
        data: { userEmails: this.users.value ? this.users.value.map((_user: { email: string }) => _user.email) : [] }
      },
      async users => {
        try {
          if (users) {
            if (users.length > 0) {
              this.users.setValue(users);
            } else {
              this.users.setValue(null);
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-topic.component',
            functionName: 'openUsersPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openTopicStatesPopup(): void {
    if (this.loading) {
      return;
    }

    this.#popup.open<TOPIC_STATE>(
      {
        component: TopicStatesPopupComponent,
        fullScreen: true,
        data: { state: this.status.value }
      },
      async state => {
        try {
          if (state) {
            this.status.setValue(state);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-topic.component',
            functionName: 'openTopicStatesPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
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
            functionName: 'deleteTopic',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  async save() {
    try {
      if (this.#form.invalid || this.loading || !this.topic) {
        this.formComponent?.setTouched();
        return;
      }

      this.loading = true;

      await this.#topicsService.putTopic({
        ...this.topic,
        title: this.title.value ? this.title.value.trim() : '',
        description: this.description.value ? this.description.value.trim() : '',
        status: this.status.value,
        accountEmails: this.users.value
          ? this.users.value.map((_user: { email: string }) => _user.email).concat([this.accountEmail])
          : [this.accountEmail]
      });
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'edit-topic.component',
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
