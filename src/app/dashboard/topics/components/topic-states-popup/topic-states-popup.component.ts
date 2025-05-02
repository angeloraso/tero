import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { TOPIC_STATE } from '@core/model';
@Component({
  selector: 'tero-topic-states-popup',
  templateUrl: 'topic-states-popup.html',
  styleUrls: ['topic-states-popup.css'],
  imports: SharedModules
})
export class TopicStatesPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);

  state: TOPIC_STATE | null = null;

  readonly TOPIC_STATE = TOPIC_STATE;

  ngOnInit() {
    const data = this.#popup.getData<{ state: TOPIC_STATE }>();
    if (data && data.state) {
      this.state = data.state;
    }
  }

  selectState(state: TOPIC_STATE) {
    this.#popup.close({ response: state });
  }

  close() {
    this.#popup.close();
  }
}
