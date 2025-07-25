import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_CALENDAR_DAY,
  BIZY_CALENDAR_MODE,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService,
  IBizyCalendarEvent
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { MONTHS, TOPIC_SUBSCRIPTION } from '@core/constants';
import { ERROR } from '@core/model';
import { GarbageTruckService, MobileService, UsersService } from '@core/services';
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
  readonly #usersService = inject(UsersService);
  readonly #mobile = inject(MobileService);

  loading = false;
  calendarEvents: Array<IBizyCalendarEvent> = [];
  viewDate: number = Date.now();
  currentDate: string = this.#getCurrentDate(this.viewDate);
  isNeighbor: boolean = false;

  readonly BIZY_CALENDAR_MODE = BIZY_CALENDAR_MODE;
  readonly BIZY_CALENDAR_DAY = BIZY_CALENDAR_DAY;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);
      this.isNeighbor = await this.#usersService.isNeighbor();
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

  openGarbageRecordPopup(data: { start: number; end: number; events: Array<IBizyCalendarEvent> }) {
    if (this.loading || !data || data.events.length > 0 || !this.isNeighbor) {
      return;
    }

    if (data.start > Date.now()) {
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

            const accountEmail = this.#auth.getEmail();
            if (!accountEmail) {
              throw new Error();
            }

            await this.#garbageTruckService.postRecord({ accountEmail, date: data.start });
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

  showGarbageTruckPopup() {
    if (this.loading || !this.isNeighbor) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('DASHBOARD.GARBAGE_TRUCK_POPUP.TITLE'),
          msg: this.#translate.get('DASHBOARD.GARBAGE_TRUCK_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            const accountEmail = this.#auth.getEmail();
            if (!accountEmail) {
              throw new Error();
            }

            const date = new Date();
            date.setHours(0, 0, 0, 0);

            await this.#garbageTruckService.postRecord({ accountEmail, date: date.getTime() });

            await this.#mobile.sendPushNotification({
              topicId: TOPIC_SUBSCRIPTION.GARBAGE,
              title: this.#translate.get('DASHBOARD.GARBAGE_NOTIFICATION.TITLE'),
              body: this.#translate.get('DASHBOARD.GARBAGE_NOTIFICATION.BODY')
            });

            this.#toast.success(this.#translate.get('DASHBOARD.GARBAGE_TRUCK_MSG'));
          }
        } catch (error) {
          this.#log.error({
            fileName: 'garbage-history.component',
            functionName: 'showGarbageTruckPopup',
            param: error
          });

          if (error instanceof Error && error.message === ERROR.ITEM_ALREADY_EXISTS) {
            this.#toast.info(this.#translate.get('DASHBOARD.GARBAGE_TRUCK_MSG'));
            return;
          }

          if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
            this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
            return;
          }

          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  previousDate() {
    this.viewDate = this.#subtractOneMonth(this.viewDate);
    this.currentDate = this.#getCurrentDate(this.viewDate);
  }

  nextDate() {
    this.viewDate = this.#addOneMonth(this.viewDate);
    this.currentDate = this.#getCurrentDate(this.viewDate);
  }

  #addOneMonth(timestamp: number) {
    const date = new Date(timestamp);
    const currentDay = date.getDate();
    date.setMonth(date.getMonth() + 1);
    // Handle cases like Jan 31 -> Feb 28/29
    if (date.getDate() < currentDay) {
      // Set to last day of previous month if the day overflowed
      date.setDate(0);
    }

    return date.getTime();
  }

  #subtractOneMonth(timestamp: number) {
    const date = new Date(timestamp);
    const currentDay = date.getDate();
    date.setMonth(date.getMonth() - 1);
    // Handle overflow (e.g., March 31 -> February 28/29)
    if (date.getDate() < currentDay) {
      date.setDate(0); // Set to the last day of the previous month
    }

    return date.getTime();
  }

  #getCurrentDate(timestamp: number): string {
    const date = new Date(timestamp);
    return `${this.#translate.get('CORE.MONTH.' + MONTHS[date.getMonth()])} - ${date.getFullYear()}`;
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
  };

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}` });
  }
}
