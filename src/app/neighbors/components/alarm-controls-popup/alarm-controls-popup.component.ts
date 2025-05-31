import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { ALARM_CONTROLS } from '@core/constants';
@Component({
  selector: 'tero-alarm-controls-popup',
  templateUrl: 'alarm-controls-popup.html',
  styleUrls: ['alarm-controls-popup.css'],
  imports: SharedModules
})
export class AlarmControlsPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #ref = inject(ChangeDetectorRef);

  controls: Array<{ value: number; selected: boolean }> = [];

  ngOnInit() {
    this.controls.length = 0;
    ALARM_CONTROLS.forEach(_control => {
      this.controls.push({
        value: _control,
        selected: false
      });
    });

    const data = this.#popup.getData<{ alarmControls: Array<number> }>();
    if (data && data.alarmControls) {
      this.controls.forEach(_control => {
        _control.selected = data.alarmControls.includes(_control.value);
      });
    }
  }

  setControl(control: { value: number; selected: boolean }) {
    control.selected = !control.selected;
    this.#ref.detectChanges();
  }

  apply() {
    this.#popup.close({
      response: {
        alarmControls: this.controls.filter(_control => _control.selected).map(_control => _control.value)
      }
    });
  }

  close() {
    this.#popup.close();
  }
}
