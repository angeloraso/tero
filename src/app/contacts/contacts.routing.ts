import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { neighborGuard } from '@core/guards';
import { AddContactComponent } from './add-contact/add-contact.component';
import { ContactsComponent } from './contacts.component';
import { EditContactComponent } from './edit-contact/edit-contact.component';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: ContactsComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    component: AddContactComponent,
    canActivate: [neighborGuard]
  },
  {
    path: ':contactId',
    component: EditContactComponent,
    canActivate: [neighborGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule {
  static COMPONENTS = [ContactsComponent, AddContactComponent, EditContactComponent];
}
