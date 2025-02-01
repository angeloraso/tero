import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTopicComponent } from './add-topic/add-topic.component';
import { EditTopicComponent } from './edit-topic/edit-topic.component';
import { TopicsComponent } from './topics.component';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicsRoutingModule {
  static COMPONENTS = [TopicsComponent, AddTopicComponent, EditTopicComponent];
}
