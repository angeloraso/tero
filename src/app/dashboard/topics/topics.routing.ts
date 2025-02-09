import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTopicComponent } from './add-topic/add-topic.component';
import { EditTopicComponent } from './edit-topic/edit-topic.component';
import { TopicMilestonesComponent } from './topic-milestones/topic-milestones.component';
import { TopicsComponent } from './topics.component';

export enum PATH {
  EMPTY = '',
  ADD = 'add',
  MILESTONES = 'milestones'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: TopicsComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    component: AddTopicComponent
  },
  {
    path: ':topicId',
    component: EditTopicComponent
  },
  {
    path: `:topicId/${PATH.MILESTONES}`,
    component: TopicMilestonesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicsRoutingModule {
  static COMPONENTS = [
    TopicsComponent,
    AddTopicComponent,
    EditTopicComponent,
    TopicMilestonesComponent
  ];
}
