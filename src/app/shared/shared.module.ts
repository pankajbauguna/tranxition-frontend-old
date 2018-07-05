import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BootstrapModule } from '../bootstrap';
import { ChartsModule } from 'ng2-charts';

import { HeaderComponent } from './components';

import {
  ADMIN_DASHBORAD,
  APPLICATIONS
} from '../shared/constants';

const components = [
  HeaderComponent
];

// const services = [
//   DashboardService,
//   DashboardResolver,
//   ApplicationsResolver
// ];

@NgModule({
  imports: [
    CommonModule,
    BootstrapModule
  ],
  declarations: components,
  exports: components,
  // providers: services
})
export class SharedModule { }
