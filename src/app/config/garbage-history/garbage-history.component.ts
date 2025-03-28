import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BIZY_CALENDAR_DAY, BIZY_CALENDAR_MODE, BizyLogService, BizyPopupService, BizyRouterService, BizyToastService, BizyTranslateService, IBizyCalendarEvent } from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { AuthService } from '@core/auth/auth.service';
import { GarbageTruckService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';

@Component({
    selector: 'tero-garbage-history',
    templateUrl: './garbage-history.html',
    styleUrls: ['./garbage-history.css'],
    imports: SharedModules
})
export class GarbageHistoryComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #auth = inject(AuthService);
  readonly #garbageTruckService = inject(GarbageTruckService);
  readonly #translate = inject(BizyTranslateService);
  readonly #popup = inject(BizyPopupService);
  readonly #home = inject(HomeService);

  loading = false;
  calendarEvents: Array<IBizyCalendarEvent> = [];

  readonly BIZY_CALENDAR_MODE = BIZY_CALENDAR_MODE;
  readonly BIZY_CALENDAR_DAY = BIZY_CALENDAR_DAY;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);
      await this.#buildCalendar();
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

  openGarbageRecordPopup(data: { start: number, end: number, events: Array<IBizyCalendarEvent>}) {
    if (this.loading || !data || data.events.length > 0) {
      return;
    }

    const date = new Date(data.start);

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: `${this.#translate.get('GARBAGE_HISTORY.RECORD_POPUP.TITLE')} (${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()})`,
          msg: this.#translate.get('GARBAGE_HISTORY.RECORD_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;

            const email = await this.#auth.getEmail();
            if (!email) {
              return;
            }

            await this.#garbageTruckService.postRecord({ accountEmail: email, date: data.start});
            await this.#buildCalendar();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'garbage-history.component',
            functionName: 'openGarbageRecordPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  #buildCalendar = async () => {
    const records = await this.#garbageTruckService.getRecords();

    this.calendarEvents = records.map(_record => {
      const endOfDay = new Date(_record.date ? _record.date : _record.id);
      endOfDay.setHours(23, 59, 59, 999);

      return {
        start: _record.date ? _record.date : Number(_record.id),
        end: endOfDay.getTime(),
        incrementsBadgeTotal: false,
        id: _record.id
      };
    });
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}` });
  }
}
