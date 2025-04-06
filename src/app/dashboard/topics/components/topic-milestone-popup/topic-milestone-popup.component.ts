import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { LONG_TEXT_MAX_LENGTH } from '@core/constants';
@Component({
  selector: 'tero-topic-milestone-popup',
  templateUrl: 'topic-milestone-popup.html',
  styleUrls: ['topic-milestone-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: SharedModules
})
export class TopicMilestonePopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  #form = this.#fb.group({
    description: ['', [Validators.maxLength(LONG_TEXT_MAX_LENGTH), Validators.required]]
  });

  get description() {
    return this.#form.get('description') as FormControl;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ description: string }>();

    if (data.description) {
      this.description.setValue(data.description);
    }
  }

  close() {
    this.#popup.close();
  }

  onDelete() {
    this.#popup.close({ response: 'delete' });
  }

  apply() {
    if (this.#form.invalid) {
      return;
    }

    this.#popup.close({
      response: {
        description: this.description.value
      }
    });
  }
}
