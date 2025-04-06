import { inject, Injectable } from '@angular/core';
import { ITopic, ITopicMilestone, Topic, TopicMilestone } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {
  readonly #database = inject(DatabaseService);

  getTopics = () => this.#database.getTopics();

  getTopic = (topicId: string) => this.#database.getTopic(topicId);

  postTopic = (topic: Omit<ITopic, 'id' | 'data' | 'milestones' | 'created' | 'updated'>) => this.#database.postTopic(new Topic(topic));

  putTopic = (topic: ITopic) =>
    this.#database.putTopic({
      id: topic.id,
      accountEmails: topic.accountEmails,
      title: topic.title,
      description: topic.description,
      status: topic.status,
      data: topic.data,
      milestones: topic.milestones,
      created: Number(topic.created) || Date.now(),
      updated: Date.now()
    });

  deleteTopic = (topic: ITopic) => this.#database.deleteTopic(topic.id);

  postTopicMilestone = (data: { topicId: string; milestone: Omit<ITopicMilestone, 'id' | 'created' | 'updated'> }) =>
    this.#database.postTopicMilestone({
      topicId: data.topicId,
      milestone: new TopicMilestone(data.milestone)
    });

  putTopicMilestone = (data: { topicId: string; milestone: ITopicMilestone }) =>
    this.#database.putTopicMilestone({
      topicId: data.topicId,
      milestone: {
        id: data.milestone.id,
        description: data.milestone.description,
        created: Number(data.milestone.created) || Date.now(),
        updated: Date.now()
      }
    });

  deleteTopicMilestone = (data: { topic: ITopic; milestone: ITopicMilestone }) =>
    this.#database.deleteTopicMilestone({
      topicId: data.topic.id,
      milestoneId: data.milestone.id
    });
}
