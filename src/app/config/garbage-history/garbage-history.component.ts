import { Component, inject, OnInit } from '@angular/core';
import { BIZY_CALENDAR_DAY, BIZY_CALENDAR_MODE, IBizyCalendarEvent } from '@bizy/components';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/services';
import { GarbageTruckService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';

@Component({
    selector: 'tero-garbage-history',
    templateUrl: './garbage-history.html',
    styleUrls: ['./garbage-history.css'],
    standalone: false
})
export class GarbageHistoryComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #garbageService = inject(GarbageTruckService);

  loading = false;
  calendarEvents: Array<IBizyCalendarEvent> = [];

  readonly BIZY_CALENDAR_MODE = BIZY_CALENDAR_MODE;
  readonly BIZY_CALENDAR_DAY = BIZY_CALENDAR_DAY;

  async ngOnInit() {
    try {
      this.loading = true;
      const records = await this.#garbageService.getRecords();

      this.calendarEvents = records.map(_record => {
        const date = new Date(_record.created);
        const startOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        );
        const endOfDay = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
          999
        );

        return {
          start: startOfDay.getTime(),
          end: endOfDay.getTime(),
          id: _record.id
        };
      });
    } catch (error) {
      this.#log.error({
        fileName: 'garbage-history.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.#router.goBack({ path: `/${HOME_PATH.CONFIG}` });
  }
}
