import {
  LOGIN,
  REGISTER,
  CONTACT_INFO,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  EMAIL_VERIFICATION,
  USER_VERIFICATION,
  AGENCY,
  COMPANY,
  FORMS,
  UPLOAD_DOCS,
  CHANGE_USERNAME,
  CHANGE_PASSWORD,
  APPLICATIONS,
  ADMIN_DASHBORAD,
  REVIEW,
  EXISTING_AGENCY_INFO
} from '../constants';
import { NavigationExtras } from '@angular/router';

export function findRouteURL(name: string) {
  let url;
  switch (name) {
    case LOGIN.NAME:
      url = LOGIN.URL;
      break;
    case REGISTER.NAME:
      url = REGISTER.URL;
      break;
    case FORGOT_PASSWORD.NAME:
      url = FORGOT_PASSWORD.URL;
      break;
    case RESET_PASSWORD.NAME:
      url = RESET_PASSWORD.URL;
      break;
    case EMAIL_VERIFICATION.NAME:
      url = EMAIL_VERIFICATION.URL;
      break;
    case USER_VERIFICATION.NAME:
      url = USER_VERIFICATION.URL;
      break;
    case CONTACT_INFO.NAME:
      url = CONTACT_INFO.URL;
      break;
    case EXISTING_AGENCY_INFO.NAME:
      url = EXISTING_AGENCY_INFO.URL;
      break;
    case AGENCY.NAME:
      url = AGENCY.URL;
      break;
    case COMPANY.NAME:
      url = COMPANY.URL;
      break;
    case FORMS.NAME:
      url = FORMS.URL;
      break;
    case UPLOAD_DOCS.NAME:
      url = UPLOAD_DOCS.URL;
      break;
    case REVIEW.NAME:
      url = REVIEW.URL;
      break;
    case CHANGE_USERNAME.NAME:
      url = CHANGE_USERNAME.URL;
      break;
    case CHANGE_PASSWORD.NAME:
      url = CHANGE_PASSWORD.URL;
      break;
    case APPLICATIONS.NAME:
      url = APPLICATIONS.URL;
      break;
    case ADMIN_DASHBORAD.NAME:
      url = ADMIN_DASHBORAD.URL;
      break;
  }

  return url;
}

export function parseUrl(url: String) {
  const splittedUrl = url.split('?');
  return splittedUrl[0];
}
