import { Component, Inject, OnInit } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { LOADING_TYPE } from '@bizy/directives';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { LOGO_PATH, WHATSAPP_URL } from '@core/constants';
import { ISecurityGuard } from '@core/model';
import {
  MobileService,
  NeighborsService,
  SecurityService,
  UsersService,
  UtilsService
} from '@core/services';
import { PopupComponent } from '@shared/components';
import { PATH } from './security.routing';
interface IGroup {
  value: number;
  lots: Set<number>;
  fee: number;
  debt: boolean;
}

@Component({
  selector: 'tero-security',
  templateUrl: './security.html',
  styleUrls: ['./security.css']
})
export class SecurityComponent implements OnInit {
  loading = false;
  showInfo = false;
  securityStaff: Array<ISecurityGuard> = Array.from({ length: 4 }, () => ({
    name: '',
    picture: '',
    description: ''
  }));
  securityFee: number = 0;
  groups: Array<IGroup> = Array.from({ length: 6 }, (_, i) => ({
    value: i + 1,
    lots: new Set(),
    fee: 0,
    debt: true
  }));
  members = 0;
  membershipFee = 0;
  isSecurity: boolean = false;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly LOGO_PATH = LOGO_PATH;
  readonly LOADING_TYPE = LOADING_TYPE;

  constructor(
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(SecurityService) private security: SecurityService,
    @Inject(UtilsService) private utils: UtilsService,
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(MobileService) private mobile: MobileService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;

      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.usersService.isConfig(),
        this.usersService.isNeighbor(),
        this.usersService.isSecurity()
      ]);

      this.isSecurity = isSecurity;

      this.showInfo = isNeighbor || isSecurity || isConfig;
      if (!this.showInfo) {
        return;
      }

      this.securityStaff = Array.from({ length: 4 }, () => ({
        name: '',
        picture: '',
        description: ''
      }));

      this.groups = Array.from({ length: 6 }, (_, i) => ({
        value: i + 1,
        lots: new Set(),
        fee: 0,
        debt: true
      }));
      this.members = 0;
      this.membershipFee = 0;
      const [neighbors, security] = await Promise.all([
        this.neighborsService.getNeighbors(),
        this.security.getSecurity()
      ]);

      neighbors.forEach(_neighbor => {
        if (_neighbor.security && this.groups[_neighbor.group - 1]) {
          this.groups[_neighbor.group - 1].lots.add(_neighbor.lot);
        }
      });

      if (security) {
        this.securityStaff = security.staff;
        this.securityFee = security.fee;
        this.groups.forEach(_group => {
          this.members += _group.lots.size;

          if (security.invoices) {
            const date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            const startDate = date.getTime();
            date.setMonth(date.getMonth() + 1);
            date.setDate(0);
            date.setHours(23, 59, 59, 999);
            const endDate = date.getTime();
            _group.debt = !security.invoices.find(
              _invoice =>
                _invoice.group === _group.value &&
                _invoice.timestamp >= startDate &&
                _invoice.timestamp <= endDate
            );
          }
        });

        this.membershipFee = this.utils.roundNumber(security.fee / this.members) ?? 0;
        this.groups = this.groups.map(_group => {
          return { ..._group, fee: this.utils.roundNumber(this.membershipFee * _group.lots.size) };
        });
      }
    } catch (error) {
      this.log.error({
        fileName: 'security.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.goBack();
  }

  async onCall(phone: string) {
    try {
      if (this.loading || !phone) {
        return;
      }

      await this.mobile.call(phone);
    } catch (error) {
      this.log.error({
        fileName: 'security.component',
        functionName: 'onCall',
        param: error
      });
      this.toast.danger();
    }
  }

  onWhatsapp(phone: string) {
    if (this.loading || !phone) {
      return;
    }

    window.open(`${WHATSAPP_URL}${phone}`, '_blank');
  }

  goToSecurityInvoices() {
    if (this.loading) {
      return;
    }

    this.router.goTo({ path: PATH.INVOICES });
  }

  goToSecurityGroup(group: IGroup) {
    if (this.loading || !group) {
      return;
    }

    this.router.goTo({ path: String(group.value) });
  }

  setGroupDebt(group: IGroup) {
    if (this.loading || !group || !group.debt || !this.isSecurity) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: `${this.translate.get('SECURITY.GROUPS.DEBT_POPUP.TITLE')} ${group.value}`,
          msg: this.translate.get('SECURITY.GROUPS.DEBT_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.security.postGroupInvoice(group.value);
            group.debt = false;
            this.groups = [...this.groups];
          }
        } catch (error) {
          this.log.error({
            fileName: 'security.component',
            functionName: 'setGroupDebt',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }
}
