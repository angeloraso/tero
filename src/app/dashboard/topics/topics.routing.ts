import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  ADD = 'add',
  MILESTONES = 'milestones'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/topics/topics.component').then(m => m.TopicsComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'topics' }
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@dashboard/topics/add-topic/add-topic.component').then(m => m.AddTopicComponent),
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'add-topic' }
  },
  {
    path: `:topicId/${PATH.MILESTONES}`,
    loadComponent: () => import('@dashboard/topics/topic-milestones/topic-milestones.component').then(m => m.TopicMilestonesComponent),
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'topic-milestones' }
  },
  {
    path: ':topicId',
    loadComponent: () => import('@dashboard/topics/edit-topic/edit-topic.component').then(m => m.EditTopicComponent),
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'edit-topic' }
  }
];
