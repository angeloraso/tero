import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { ALARMS } from '@core/constants';

@Component({
  selector: 'tero-alarm-popup',
  templateUrl: 'alarm-popup.html',
  styleUrls: ['alarm-popup.css'],
  imports: SharedModules
})
export class AlarmPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);

  alarm: number | null = null;

  readonly ALARMS = ALARMS;

  ngOnInit() {
    const data = this.#popup.getData<{ alarm: number }>();
    if (data && data.alarm) {
      this.alarm = data.alarm;
    }
  }

  selectAlarm(alarm: number | null) {
    this.#popup.close({ response: { alarmNumber: alarm } });
  }

  close() {
    this.#popup.close();
  }
}
