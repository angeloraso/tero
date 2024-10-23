import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BIZY_TAG_TYPE } from '@bizy/components';
import {
  AVAILABLE_LOTS,
  AVAILABLE_SECURITY_GROUPS,
  DEFAULT_USER_PICTURE,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH
} from '@core/constants';
import { MobileService } from '@core/services';

@Component({
  selector: 'tero-neighbor-form',
  templateUrl: './neighbor-form.html',
  styleUrls: ['./neighbor-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NeighborFormComponent {
  @Input() alarmNumber: number | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    group: number;
    surname: string;
    name: string;
    alarmNumber: number | null;
    alarmControls: Array<number>;
    security: boolean;
    lot: number;
  }>();
  form: FormGroup;
  isMobile = true;

  alarmControlSearch: string | number = '';
  selectedAlarmControls: Array<number> = [];
  availableAlarmControls: Array<number> = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ];

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly MIN_VALUE = 0;
  readonly MAX_LOT_VALUE = AVAILABLE_LOTS;
  readonly ALARMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly GROUPS = AVAILABLE_SECURITY_GROUPS;
  readonly DEFAULT_USER_PICTURE = DEFAULT_USER_PICTURE;

  @Input() set group(group: number) {
    if (!group) {
      return;
    }

    this._group.setValue(group);
  }

  @Input() set alarmControls(alarmControls: Array<number>) {
    if (!alarmControls) {
      return;
    }

    this.selectedAlarmControls = [...alarmControls];
    this.availableAlarmControls = this.availableAlarmControls.filter(
      _control => !alarmControls.includes(_control)
    );
  }

  @Input() set surname(surname: string) {
    if (!surname) {
      return;
    }

    this._surname.setValue(surname);
  }

  @Input() set name(name: string) {
    if (!name) {
      return;
    }

    this._name.setValue(name);
  }

  @Input() set lot(lot: number) {
    if (!lot) {
      return;
    }

    this._lot.setValue(lot);
  }

  @Input() set security(security: boolean) {
    if (typeof security === 'undefined' || security === null) {
      return;
    }

    this.setSecurity(security);
  }

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    @Inject(MobileService) private mobile: MobileService
  ) {
    this.isMobile = this.mobile.isMobile();
    this.form = this.fb.group({
      id: [null],
      created: [null],
      updated: [null],
      group: [null],
      surname: [null],
      name: [null, [Validators.required]],
      security: [true],
      lot: [
        null,
        [Validators.min(this.MIN_VALUE), Validators.max(this.MAX_LOT_VALUE), Validators.required]
      ]
    });
  }

  get _id() {
    return this.form.get('id') as FormControl;
  }

  get _created() {
    return this.form.get('created') as FormControl;
  }

  get _updated() {
    return this.form.get('updated') as FormControl;
  }

  get _group() {
    return this.form.get('group') as FormControl;
  }

  get _surname() {
    return this.form.get('surname') as FormControl;
  }

  get _name() {
    return this.form.get('name') as FormControl;
  }

  get _security() {
    return this.form.get('security') as FormControl;
  }

  get _lot() {
    return this.form.get('lot') as FormControl;
  }

  setSecurity(enable: boolean) {
    this._security.setValue(enable);

    if (enable) {
      this._group.setValidators([Validators.required]);
    } else {
      this._group.clearValidators();
    }

    this._group.updateValueAndValidity();
  }

  addControl(control: number) {
    if (!control) {
      return;
    }

    this.selectedAlarmControls.push(control);

    const index = this.availableAlarmControls.findIndex(_control => _control === control);
    if (index !== -1) {
      this.availableAlarmControls.splice(index, 1);
    }

    this.selectedAlarmControls = [...this.selectedAlarmControls].sort((a, b) => a - b);
    this.availableAlarmControls = [...this.availableAlarmControls].sort((a, b) => a - b);
  }

  removeControl(control: number) {
    if (!control) {
      return;
    }

    this.availableAlarmControls.push(control);

    const index = this.selectedAlarmControls.findIndex(_control => _control === control);
    if (index !== -1) {
      this.selectedAlarmControls.splice(index, 1);
    }

    this.selectedAlarmControls = [...this.selectedAlarmControls].sort((a, b) => a - b);
    this.availableAlarmControls = [...this.availableAlarmControls].sort((a, b) => a - b);
  }

  _confirm() {
    if (this.form.invalid) {
      return;
    }

    this.save.emit({
      group: this._group.value,
      alarmNumber: this.alarmNumber,
      alarmControls: this.selectedAlarmControls,
      surname: this._surname.value.trim(),
      name: this._name.value.trim(),
      security: this._security.value,
      lot: this._lot.value
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
