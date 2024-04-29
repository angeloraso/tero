import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';

export enum PATH {
  EMPTY = '',
  SIGN_IN = 'sign-in'
}

const routes: Routes = [
  {
    path: '',
    redirectTo: PATH.SIGN_IN,
    pathMatch: 'full'
  },
  {
    path: PATH.SIGN_IN,
    component: SignInComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
  static COMPONENTS = [SignInComponent];
}
