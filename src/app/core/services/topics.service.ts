import { inject, Injectable } from '@angular/core';
import { ITopic, ITopicMilestone, Topic, TopicMilestone } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {
  readonly #database = inject(DatabaseService);

  getTopics() {
    return new Promise<Array<ITopic>>(async (resolve, reject) => {
      try {
        const topics = await this.#database.getTopics();
        resolve(topics ?? []);
      } catch (error) {
        reject(error);
      }
    });
  }

  getTopic(topicId: string) {
    return this.#database.getTopic(topicId);
  }

  postTopic(topic: Omit<ITopic, 'id' | 'milestones' | 'created' | 'updated'>): Promise<void> {
    return this.#database.postTopic(new Topic(topic));
  }

  putTopic(topic: ITopic): Promise<void> {
    return this.#database.putTopic({
      id: topic.id,
      accountEmails: topic.accountEmails,
      title: topic.title,
      description: topic.description,
      status: topic.status,
      milestones: topic.milestones,
      created: Number(topic.created) || Date.now(),
      updated: Date.now()
    });
  }

  deleteTopic(topic: ITopic): Promise<void> {
    return this.#database.deleteTopic(topic.id);
  }

  postTopicMilestone(data: {
    topicId: string;
    milestone: Omit<ITopicMilestone, 'id' | 'created' | 'updated'>;
  }): Promise<void> {
    return this.#database.postTopicMilestone({
      topicId: data.topicId,
      milestone: new TopicMilestone(data.milestone)
    });
  }

  putTopicMilestone(data: { topicId: string; milestone: ITopicMilestone }): Promise<void> {
    return this.#database.putTopicMilestone({
      topicId: data.topicId,
      milestone: {
        id: data.milestone.id,
        description: data.milestone.description,
        created: Number(data.milestone.created) || Date.now(),
        updated: Date.now()
      }
    });
  }

  deleteTopicMilestone(data: { topic: ITopic; milestone: ITopicMilestone }): Promise<void> {
    return this.#database.deleteTopicMilestone({
      topicId: data.topic.id,
      milestoneId: data.milestone.id
    });
  }
}
