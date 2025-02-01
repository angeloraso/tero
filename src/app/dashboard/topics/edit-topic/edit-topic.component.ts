import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { ITopic, TOPIC_STATE } from '@core/model';
import { TopicsService } from '@core/services';
import { PopupComponent } from '@shared/components';

@Component({
  selector: 'tero-edit-topic',
  templateUrl: './edit-topic.html',
  styleUrls: ['./edit-topic.css']
})
export class EditTopicComponent implements OnInit {
  topic: ITopic | null = null;
  topicId: string | null = null;
  loading = false;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(TopicsService) private topicsService: TopicsService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.topicId = this.router.getId(this.activatedRoute, 'topicId');
      if (!this.topicId) {
        this.goBack();
        return;
      }

      const topic = await this.topicsService.getTopic(this.topicId);

      if (!topic) {
        this.goBack();
        return;
      }

      this.topic = topic;
    } catch (error) {
      this.log.error({
        fileName: 'edit-topic.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteTopic = () => {
    if (!this.topic || this.loading) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('TOPICS.EDIT_TOPIC.DELETE_POPUP.TITLE'),
          msg: `${this.translate.get('TOPICS.EDIT_TOPIC.DELETE_POPUP.MSG')}: ${this.topic.title}`
        }
      },
      async res => {
        try {
          if (res && this.topic) {
            this.loading = true;
            await this.topicsService.deleteTopic(this.topic);
            this.goBack();
          }
        } catch (error) {
          this.log.error({
            fileName: 'edit-topic.component',
            functionName: 'deleteContact',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.router.goBack();
  }

  async save(topic: { title: string; description: string; status: TOPIC_STATE }) {
    try {
      if (!topic) {
        return;
      }

      this.loading = true;
      await this.topicsService.putTopic({
        ...this.topic!,
        ...topic
      });
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'edit-topic.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
