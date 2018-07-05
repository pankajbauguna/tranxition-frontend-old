import { Constant } from '../index';
import { environment } from '../../../environments/environment';

export const APIUrls: Constant = {
  USER_LOGIN: 'user/login',
  USER_LOGOUT: 'user/logout',
  REGISTER_USER: 'user/create',
  REGISTER_ADMIN_USER: 'user/admin/create',
  FORGOT_PASSWORD: 'user/forgotPassword',
  GET_ADMIN_USER: 'user/admin/listing',
  RESEND_EMAIL: 'user/resendEmail',
  RESET_PASSWORD: 'user/resetPassword',
  CHECK_PASSWORD_TOKEN: 'user/validateResetPasswordToken',
  EMAIL_VERIFICATION_LINK : 'user/validateEmailVerificationToken',
  UPDATE_PERSONAL_RECORD: 'user/personal',
  GET_USER_DETAIL: 'user/getContactInfo',
  GET_CONTACT_INFO: 'user/getContactInfo',
  CHANGE_PASSWORD: 'user/changePassword',
  GET_STAFFINGS_SPECIALTIESTS: 'staffingSpecialtiest/getAll',
  GET_STATES: 'states/getAll',
  GET_SERVICE_LINES: 'serviceLine/getAll',
  SAVE_APPLICATION: 'application/',
  GET_APPLICATION: 'application/',
  UPDATE_APPLICATION: 'application/',
  REVIEW_DOC_APPLICATION: 'application/',
  GET_DOCU_SIGN_URL: 'user/docuSignURL',
  SAVE_COMPANY: 'company/add',
  CHANGE_USERNAME: 'user/changeUsername',
  USERNAME_VERIFICATION_LINK : 'user/validateChangeUsernameToken',
  GET_AGENCY_DETAIL: 'agencies',
  GET_APPLICATION_COUNTS : 'application/applicationsState',
  GET_APPLICATION_BY_STATUS : 'application/getApplicationsByState',
  DOWNLOAD_HOST: environment.downloadHost,
  DOCUMENT_DOWNLOAD: environment.apiHost+'application/getDocument',
  GET_APPLICATION_BY_AGENCY_NAME: 'application/search',
  RESET_APPLICATION: 'application/',
  UNLOCK_APPLICATION: 'application/unlock/'
};
