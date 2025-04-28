import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { NO_ID, SECURITY_GROUPS } from '@core/constants';

@Component({
  selector: 'tero-security-group-popup',
  templateUrl: 'security-group-popup.html',
  styleUrls: ['security-group-popup.css'],
  imports: SharedModules
})
export class SecurityGroupPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);

  group: number | null = null;

  readonly GROUPS = SECURITY_GROUPS;
  readonly NO_ID = NO_ID;

  ngOnInit() {
    const data = this.#popup.getData<{ group: number }>();
    if (data && data.group) {
      this.group = data.group;
    }
  }

  selectGroup(group: number | null) {
    this.#popup.close({ response: group });
  }

  close() {
    this.#popup.close();
  }
}
