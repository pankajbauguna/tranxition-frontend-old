export interface Authenticate {
  email: string;
  password: string;
  reset_password_key: string;
  agency_code: string
}

export interface Token {
  token: string;
}

export interface PersonalRecord {
  name: string;
  title: string;
  officePhone: string;
  cellPhone: string;
  fax: string;
  territory: string;
  applicationId: string;
}

export interface ChangePassword {
  oldPassword: string;
  password: string;
}

export interface ChangeUsername {
  new_email: string;
  password: string;
}


