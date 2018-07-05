import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CookieService } from 'ngx-cookie';

import { PersonalRecord, ChangePassword, ChangeUsername, Token } from '../../shared/models/user';
import { APIUrls, LOGGED_USER_INFO_ACTION } from '../../shared/constants';
import { StoreService } from '../../shared';

@Injectable()
export class UserService {
  store = new EventEmitter<any>();
  private data: any = {};

  constructor(
    private cookie: CookieService,
    private http: HttpClient,
    private storeService: StoreService
  ) { }

  get(key = '', isForcedDispatch = false) {
    if (isForcedDispatch) {
      this.forceDispatch();
    }
    if (!!key) {
      return this.data[key];
    }
    return this.data ? this.data : {};
  }

  set() {
    this.store.emit(this.data);
  }

  update({ name, title, territory, officePhone, cellPhone, fax }, applicationId : PersonalRecord) {
    const { UPDATE_PERSONAL_RECORD } = APIUrls;
    const newData = { name, title, territory, officePhone, cellPhone, fax };
    return this.http
      .post(UPDATE_PERSONAL_RECORD + '/' + applicationId, newData)
      .map(
        res => {
          this.data.personal = newData;
          this.set();
          return res;
        }
      );
  }

  fetch(id = '') {
    const { GET_CONTACT_INFO } = APIUrls;
    return this.http
      .get(GET_CONTACT_INFO, { params: id ? { id: id } : {}})
      .map(
        res => {
          this.data = res;
          this.set();
          return res;
        }
      );
  }

  forceDispatch() {
    this.store.emit(this.data);
  }

  changePassword({ oldPassword, password }: ChangePassword) {
    const { CHANGE_PASSWORD } = APIUrls;
    return this.http
      .post(CHANGE_PASSWORD, { oldPassword, newPassword: password });
  }

  changeUsername({ new_email, password }: ChangeUsername) {
    const { CHANGE_USERNAME } = APIUrls;
    return this.http
      .post(CHANGE_USERNAME, { email: new_email, password: password });
  }

  isUserAdmin() {
    return this.data.role === 'admin';
  }

  destroy() {
    this.data = {};
    this.store.emit(this.data);
  }
}
