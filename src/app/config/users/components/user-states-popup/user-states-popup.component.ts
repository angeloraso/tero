import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { USER_STATE } from '@core/model';
@Component({
  selector: 'tero-user-states-popup',
  templateUrl: 'user-states-popup.html',
  styleUrls: ['user-states-popup.css'],
  imports: SharedModules
})
export class UserStatesPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);

  state: USER_STATE | null = null;

  readonly USER_STATE = USER_STATE;

  ngOnInit() {
    const data = this.#popup.getData<{ state: USER_STATE }>();
    if (data && data.state) {
      this.state = data.state;
    }
  }

  selectState(state: USER_STATE) {
    this.#popup.close({ response: state });
  }

  close() {
    this.#popup.close();
  }
}
