import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { USER_ROLE } from '@core/model';
@Component({
  selector: 'tero-user-roles-popup',
  templateUrl: 'user-roles-popup.html',
  styleUrls: ['user-roles-popup.css'],
  imports: SharedModules
})
export class UserRolesPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #ref = inject(ChangeDetectorRef);

  roles: Array<{ value: USER_ROLE; selected: boolean }> = [];

  ngOnInit() {
    this.roles.length = 0;
    for (const key in USER_ROLE) {
      this.roles.push({
        value: USER_ROLE[<USER_ROLE>key],
        selected: false
      });
    }

    const data = this.#popup.getData<{ roles: Array<USER_ROLE> }>();
    if (data && data.roles) {
      this.roles.forEach(_role => {
        _role.selected = data.roles.includes(_role.value);
      });
    }
  }

  setRole(role: { value: USER_ROLE; selected: boolean }) {
    role.selected = !role.selected;
    this.#ref.detectChanges();
  }

  apply() {
    this.#popup.close({ response: this.roles.filter(_role => _role.selected).map(_role => _role.value) });
  }

  close() {
    this.#popup.close();
  }
}
