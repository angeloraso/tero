import { inject, Injectable } from '@angular/core';
import { ITopic, Topic } from '@core/model';
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
      accountEmail: topic.accountEmail,
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
}
