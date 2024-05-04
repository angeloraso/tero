import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';

export enum PATH {
  EMPTY = '',
  SIGN_IN = 'sign-in'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: SignInComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
  static COMPONENTS = [SignInComponent];
}
