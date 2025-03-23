import { Routes } from '@angular/router';

export enum PATH {
  EMPTY = '',
  ADD = 'add',
  MILESTONES = 'milestones'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/topics/topics.component').then(m => m.TopicsComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@dashboard/topics/add-topic/add-topic.component').then(m => m.AddTopicComponent)
  },
  {
    path: `:topicId/${PATH.MILESTONES}`,
    loadComponent: () => import('@dashboard/topics/topic-milestones/topic-milestones.component').then(m => m.TopicMilestonesComponent)
  },
  {
    path: ':topicId',
    loadComponent: () => import('@dashboard/topics/edit-topic/edit-topic.component').then(m => m.EditTopicComponent)
  }
];
