import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { BootstrapModule } from '../bootstrap';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts';
import { TextMaskModule } from 'angular2-text-mask';

import {
  QualivisService,
  UserService,
  CompanyService,
  ApplicationService,
  AgencyService,
  FormsService,
  SpecialityService,
  ServiceLineService,
  StatesService,
  UploadDocsService,
  FormGuardService,
  DashboardService
} from './services';

import {
  AgencyFormComponent,
  CompanyFormComponent,
  FormsFormComponent,
  ContactInfoFormComponent,
  ReviewFormComponent,
  ThanksFormComponent,
  UploadDocsFormComponent,
  ChangePasswordFormComponent,
  ChangeUsernameFormComponent,
  LayoutComponent,
  InfoComponent
} from './components';
import { QualivisPageComponent } from './containers/qualivis.component';

import {
  StatesResolver,
  ApplicationResolver,
  CompanyResolver,
  AgencyResolver,
  UserResolver,
  FormsResolver,
  SpecialityResolver,
  ServiceLineResolver,
  UploadDocsResolver,
  DashboardResolver
} from './resolver';

import {
  CONTACT_INFO,
  AGENCY,
  COMPANY,
  FORMS,
  UPLOAD_DOCS,
  REVIEW,
  THANKS,
  CHANGE_PASSWORD,
  CHANGE_USERNAME,
  ADMIN_DASHBORAD,
  APPLICATIONS,
  EXISTING_AGENCY_INFO
} from '../shared/constants';

import { LoggedUserRoleResolver } from '../shared/resolvers';
import { SharedModule } from '../shared';

const components = [
  QualivisPageComponent,
  LayoutComponent,
  ContactInfoFormComponent,
  AgencyFormComponent,
  CompanyFormComponent,
  FormsFormComponent,
  UploadDocsFormComponent,
  ReviewFormComponent,
  ThanksFormComponent,
  ChangePasswordFormComponent,
  ChangeUsernameFormComponent,
  InfoComponent
];

const services = [
  QualivisService,
  UserService,
  CompanyService,
  AgencyService,
  ApplicationService,
  SpecialityService,
  ServiceLineService,
  StatesService,
  FormsService,
  UploadDocsService,
  FormGuardService,
  DashboardService,

  StatesResolver,
  ApplicationResolver,
  CompanyResolver,
  AgencyResolver,
  UserResolver,
  FormsResolver,
  SpecialityResolver,
  ServiceLineResolver,
  UploadDocsResolver,
  DashboardResolver
];

@NgModule({
  imports: [
    CommonModule,
    BootstrapModule,
    SharedModule,
    ReactiveFormsModule,
    MomentModule,
    ChartsModule,
    TextMaskModule,
    RouterModule.forChild([
      {
        path: '',
        component: QualivisPageComponent,
        children: [
          { path: '', redirectTo: EXISTING_AGENCY_INFO.NAME, pathMatch: 'full' },
          {
            path: CONTACT_INFO.NAME,
            component: ContactInfoFormComponent,
            canActivate: [FormGuardService],
            resolve: {
              user: UserResolver,
              application: ApplicationResolver,
              userRole: LoggedUserRoleResolver
            }
          },
          {
            path: EXISTING_AGENCY_INFO.NAME,
            component: InfoComponent,
            canActivate: [FormGuardService],
            resolve: {
              user: UserResolver,
              application: ApplicationResolver,
              userRole: LoggedUserRoleResolver
            }
          },
          {
            path: AGENCY.NAME,
            component: AgencyFormComponent,
            canActivate: [FormGuardService],
            resolve: {
              user: UserResolver,
              agency: AgencyResolver,
              application: ApplicationResolver,
              userRole: LoggedUserRoleResolver
            }
          },
          {
            path: COMPANY.NAME,
            component: CompanyFormComponent,
            canActivate: [FormGuardService],
            resolve: {
              states: StatesResolver,
              company: CompanyResolver,
              userRole: LoggedUserRoleResolver,
              application: ApplicationResolver
            }
          },
          {
            path: FORMS.NAME,
            component: FormsFormComponent,
            canActivate: [FormGuardService],
            resolve: {
              speciality : SpecialityResolver,
              serviceLine: ServiceLineResolver,
              forms: FormsResolver,
              userRole: LoggedUserRoleResolver,
              application: ApplicationResolver
            }
          },
          {
            path: UPLOAD_DOCS.NAME,
            component: UploadDocsFormComponent,
            canActivate: [FormGuardService],
            resolve: {
              uploadDocs: UploadDocsResolver,
              forms: FormsResolver,
              serviceLines: ServiceLineResolver,
              userRole: LoggedUserRoleResolver
            }
          },
          {
            path: REVIEW.NAME,
            component: ReviewFormComponent,
            canActivate: [FormGuardService],
            resolve: {
              user: UserResolver,
              states: StatesResolver,
              speciality : SpecialityResolver,
              serviceLine: ServiceLineResolver,
              application: ApplicationResolver,
              userRole: LoggedUserRoleResolver
            }
          },
          { path: CHANGE_PASSWORD.NAME, component: ChangePasswordFormComponent },
          { path: CHANGE_USERNAME.NAME, component: ChangeUsernameFormComponent },
          { path: THANKS.NAME, component: ThanksFormComponent,
            resolve: {
              application: ApplicationResolver
            }
          },
        ]
      }
    ])
  ],
  declarations: components,
  exports: components,
  providers: services,
})
export class QualivisModule { }
