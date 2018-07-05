import { Constant } from '../index';

export const RegexPatterns: Constant = {
  EMAIL_PATTERN: '^(([^<>()\\[\\]\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
  PASSWORD_PATTERN: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,32}$',
  PHONE_PATTERN: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
  FEDERAL_TAX_ID: '^[0-9]{2}-[0-9]{7}$',
  URL_PATTERN: '^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$',
  DOMAIN_PATTERN: '^([a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}?(\/.*)?$',
  NUMBER_PATTERN: '^[0-9]*$',
  FP_NUMBER_PATTERN: '^(\\d{1,3}(\\,\\d{3})*|(\\d+))(\\.\\d{2})?$',
  US_ZIP_CODE: '(^\\d{5}$)|(^\\d{5}-\\d{4}$)',
  JC_ID_PATTERN: '^[0-9]{6}$',
  LINKEDIN_PATTERN: '^(http:\/\/)?(https:\/\/)?(www\.)?(linkedin)\.com\/(#!\/)?[a-zA-Z0-9(\.\?)?]',
  FACEBOOK_PATTERN: '^(http:\/\/)?(https:\/\/)?(www\.)?(facebook|fb)\.com\/(#!\/)?[a-zA-Z0-9(\.\?)?]',
  TEXT_PATTERN: '^[A-Za-z]*$',
  TEXT_AND_SPACES_PATTERN: '^[a-zA-Z ]*$'
};
