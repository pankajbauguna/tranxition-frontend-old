import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PersonalRecord, ChangePassword, ChangeUsername, Token } from '../../shared/models/user';
import { APIUrls } from '../../shared/constants';


@Injectable()
export class QualivisService {
  constructor(
    private http: HttpClient
  ) {}

  upDatePersonalRecord({ name, title, territory, officePhone, cellPhone, fax }: PersonalRecord) {
    const { UPDATE_PERSONAL_RECORD } = APIUrls;
    return this.http
      .post(UPDATE_PERSONAL_RECORD, { name, title, territory, officePhone, cellPhone, fax });
  }

  getUserDetail() {
    const { GET_USER_DETAIL } = APIUrls;
    return this.http
      .post(GET_USER_DETAIL, {});
  }

  changePassword({ oldPassword, password }: ChangePassword) {
    const { CHANGE_PASSWORD } = APIUrls;
    return this.http
      .post(CHANGE_PASSWORD, { oldPassword, newPassword : password });
  }

  changeUsername({ new_email, password }: ChangeUsername) {
    const { CHANGE_USERNAME } = APIUrls;
    return this.http
      .post(CHANGE_USERNAME, { email:new_email, password : password });
  }

  getStaffingSpecialtiest() {
    const { GET_STAFFINGS_SPECIALTIESTS } = APIUrls;
    return this.http
      .get(GET_STAFFINGS_SPECIALTIESTS, {});
  }

  getServiceLines() {
    const { GET_SERVICE_LINES } = APIUrls;
    return this.http
      .get(GET_SERVICE_LINES, {});
  }

  getApplication() {
    const { GET_APPLICATION } = APIUrls;
    return this.http
      .get(GET_APPLICATION, {});
  }

  saveApplication(tag, data) {
    const { SAVE_APPLICATION } = APIUrls;
    return this.http
      .patch(SAVE_APPLICATION, { tag, data });
  }
}
