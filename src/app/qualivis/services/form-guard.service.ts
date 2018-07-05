import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { ApplicationService } from './application.service';
import { UserService } from './user.service';
import {
  COMPANY,
  CONTACT_INFO,
  EXISTING_AGENCY_INFO,
  AGENCY,
  FORMS,
  UPLOAD_DOCS,
  REVIEW,
  ADMIN_DASHBORAD
} from '../../shared/constants';
import { AppService } from '../../shared/index';

@Injectable()
export class FormGuardService implements CanActivate {
  constructor(
    private applicationService: ApplicationService,
    private userService: UserService,
    private router: Router,
    private appService: AppService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.appService.loader('start');
    const { queryParams: { id }} = route;

    return this.applicationService.fetch(id)
      .map((res) => {
        if (id) {
          state.url = state.url.split('?')[0];
        }

        const dynamicKey = 'filledForms';
        const agencyKey = 'isExistingAgency';

        if (!res.hasOwnProperty('_id') && id) {
          return true;
        }
        const { [dynamicKey]: { contactInfo, agency, company, forms, isUploadDocsCompleted, review }, [agencyKey]: isExistingAgency } = res;
        let previousFormStatus, path;

        switch (state.url) {
          case EXISTING_AGENCY_INFO.URL:
            previousFormStatus = true;
            if (!isExistingAgency) {
              previousFormStatus = false;
              path = CONTACT_INFO.URL;
            }
            break;
          case COMPANY.URL:
            previousFormStatus = contactInfo;
            path = CONTACT_INFO.URL;
            if (isExistingAgency) {
              previousFormStatus = false;
              path = CONTACT_INFO.URL;
            }
            break;
          case AGENCY.URL:
            previousFormStatus = company;
            path = COMPANY.URL;
            break;
          case FORMS.URL:
            previousFormStatus = agency;
            path = AGENCY.URL;
            break;
          case UPLOAD_DOCS.URL:
            previousFormStatus = forms;
            path = FORMS.URL;
            break;
          case REVIEW.URL:
            previousFormStatus = id ? true : isUploadDocsCompleted;
            path = UPLOAD_DOCS.URL;
            break;
          default:
            previousFormStatus = true;
            break;
        }

        if (!previousFormStatus) {
          const navigationExtras: NavigationExtras = {
            queryParams: { 'id': id }
          };
          this.router.navigate([id ? REVIEW.URL : path], id ? navigationExtras : {});
        }
        return previousFormStatus;
      })
      .catch(err => {
        return of(false);
      });
  }
}
