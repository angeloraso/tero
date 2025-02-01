import { Component, inject } from '@angular/core';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';
import { TOPIC_STATE } from '@core/model';
import { TopicsService } from '@core/services';

@Component({
  selector: 'tero-add-topic',
  templateUrl: './add-topic.html',
  styleUrls: ['./add-topic.css']
})
export class AddTopicComponent {
  readonly #topicsService = inject(TopicsService);
  readonly #auth = inject(AuthService);
  readonly #router = inject(BizyRouterService);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);

  loading: boolean = false;

  goBack() {
    this.#router.goBack();
  }

  async save(topic: { title: string; description: string; status: TOPIC_STATE }) {
    try {
      if (!topic || this.loading) {
        return;
      }

      this.loading = true;
      const accountEmail = await this.#auth.getEmail();
      if (!accountEmail) {
        throw new Error();
      }

      await this.#topicsService.postTopic({ ...topic, accountEmail });
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'add-topic.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
