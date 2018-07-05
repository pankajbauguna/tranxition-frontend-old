import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChartsModule } from 'ng2-charts';
import { MomentModule, LocalTimePipe, DateFormatPipe } from 'angular2-moment';

import { BootstrapModule } from '../bootstrap';
import { SharedModule } from '../shared';

import {
  LayoutComponent,
  DashboardComponent,
  ApplicationsComponent,
  ApplicationResetComponent,
  UsersComponent
} from './components';
import { AdminPageComponent } from './containers/admin.component';

import {
  ADMIN_DASHBORAD,
  APPLICATIONS,
  APPLICATION_RESET,
  ADMIN_USERS
} from '../shared/constants';

import {
  DashboardService
} from './services';

import {
  DashboardResolver,
  ApplicationsResolver
} from './resolvers';

const components = [
  AdminPageComponent,
  LayoutComponent,
  DashboardComponent,
  ApplicationsComponent,
  ApplicationResetComponent,
  UsersComponent
];

const services = [
  DashboardService,
  DashboardResolver,
  ApplicationsResolver,
  LocalTimePipe,
  DateFormatPipe
];

@NgModule({
  imports: [
    CommonModule,
    BootstrapModule,
    SharedModule,
    ChartsModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminPageComponent,
        children: [
          { path: '', redirectTo: ADMIN_DASHBORAD.NAME, pathMatch: 'full' },
          {
            path: ADMIN_DASHBORAD.NAME,
            component: DashboardComponent,
            resolve: {
              adminData: DashboardResolver
            }
          },
          {
            path: APPLICATIONS.NAME,
            component: ApplicationsComponent,
            resolve: {
              applications: ApplicationsResolver
            }
          },
          {
            path: APPLICATION_RESET.NAME,
            component: ApplicationResetComponent
          },
          {
            path: ADMIN_USERS.NAME,
            component: UsersComponent
          }
        ]
      }
    ])
  ],
  declarations: components,
  exports: components,
  providers: services
})
export class AdminModule { }
