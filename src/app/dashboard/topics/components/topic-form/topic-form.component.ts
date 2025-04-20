import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BIZY_TAG_TYPE, BizyDeviceService } from '@bizy/core';
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { IUser, TOPIC_STATE, USER_STATE } from '@core/model';
import { BehaviorSubject, filter } from 'rxjs';
import { take } from 'rxjs/operators';

interface IExtendedUser extends IUser {
  _name: string;
}

@Component({
  selector: 'tero-topic-form',
  templateUrl: './topic-form.html',
  styleUrls: ['./topic-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: SharedModules
})
export class TopicFormComponent {
  readonly #device = inject(BizyDeviceService);
  readonly #fb = inject(FormBuilder);
  readonly #auth = inject(AuthService);
  readonly #ref = inject(ChangeDetectorRef);

  @Input() disabled: boolean = false;
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<{
    title: string;
    description: string;
    accountEmails: Array<string>;
    status: TOPIC_STATE;
  }>();
  form: FormGroup = this.#fb.group({
    title: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH), Validators.required]],
    status: [TOPIC_STATE.ACTIVE, [Validators.required]]
  });

  isDesktop: boolean = this.#device.isDesktop();
  accountEmail = this.#auth.getEmail()!;
  userSearch: string | number = '';
  availableUsers: Array<IExtendedUser> = [];
  selectedUsers: Array<IExtendedUser> = [];

  #usersReady = new BehaviorSubject<boolean>(false);

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly TOPIC_STATE = TOPIC_STATE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly DESCRIPTION_LENGTH = 1024;

  @Input() set title(title: string) {
    if (!title) {
      return;
    }

    this._title.setValue(title);
  }

  @Input() set description(description: string) {
    if (!description) {
      return;
    }

    this._description.setValue(description);
  }

  @Input() set status(status: TOPIC_STATE) {
    if (!status) {
      return;
    }

    this._status.setValue(status);
  }

  @Input() set users(users: Array<IUser>) {
    if (!users || users.length === 0) {
      return;
    }

    this.availableUsers = users
      .filter(_user => _user.status === USER_STATE.ACTIVE && _user.email !== this.accountEmail)
      .map(_user => {
        return {
          ..._user,
          _name: _user.name || _user.email
        };
      });

    this.#usersReady.next(true);
  }

  @Input() set accountEmails(accountEmails: Array<string>) {
    if (!accountEmails || accountEmails.length === 0) {
      return;
    }

    this.#usersReady
      .pipe(
        filter(ready => ready === true),
        take(1)
      )
      .subscribe(() => {
        this.selectedUsers.length = 0;
        accountEmails.forEach(_email => {
          const index = this.availableUsers.findIndex(_user => _user.email === _email && _user.status === USER_STATE.ACTIVE);
          if (index !== -1) {
            this.selectedUsers.push({
              ...this.availableUsers[index],
              _name: this.availableUsers[index].name || this.availableUsers[index].email
            });
            this.availableUsers.splice(index, 1);
          }
        });

        this.refresh();
      });
  }

  get _title() {
    return this.form.get('title') as FormControl;
  }

  get _description() {
    return this.form.get('description') as FormControl;
  }

  get _status() {
    return this.form.get('status') as FormControl;
  }

  addUser(user: IExtendedUser) {
    if (!user) {
      return;
    }

    this.selectedUsers.push(user);

    const index = this.availableUsers.findIndex(_user => _user === user);
    if (index !== -1) {
      this.availableUsers.splice(index, 1);
    }

    this.refresh();
  }

  removeUser(user: IExtendedUser) {
    if (!user) {
      return;
    }

    this.availableUsers.push(user);

    const index = this.selectedUsers.findIndex(_user => _user === user);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
    }

    this.refresh();
  }

  refresh() {
    this.selectedUsers = [...this.selectedUsers];
    this.availableUsers = [...this.availableUsers];
  }

  _confirm() {
    if (this.form.invalid) {
      this.#ref.detectChanges();
      return;
    }

    this.confirmed.emit({
      title: this._title.value ? this._title.value.trim() : '',
      description: this._description.value ? this._description.value.trim() : '',
      status: this._status.value,
      accountEmails: this.selectedUsers.map(_user => _user.email).concat([this.accountEmail])
    });
  }

  _cancel() {
    this.cancelled.emit();
  }
}
