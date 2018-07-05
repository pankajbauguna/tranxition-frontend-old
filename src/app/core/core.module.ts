import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { BootstrapModule } from '../bootstrap';

import { BlockUIModule } from 'ng-block-ui';
import { ErrorComponent } from './components';
import { ERROR } from '../shared/constants';

export const COMPONENTS = [
  AppComponent,
  ErrorComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: ERROR.NAME,
        component: ErrorComponent
      }
    ]),
    BootstrapModule,
    BlockUIModule
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class CoreModule {
  static forRoot() {
    return {
      ngModule: CoreModule,
      providers: [],
    };
  }
}
