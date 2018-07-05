import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { _throw } from 'rxjs/observable/throw';

import { PersonalRecord, ChangePassword, ChangeUsername, Token } from '../../shared/models/user';
import { APIUrls, APPLICATION_DATA_ACTION, APPROVE_APPLICATION_ACTION } from '../../shared/constants';
import { UserService } from './user.service';
import { CompanyService } from './company.service';
import { AgencyService } from './agency.service';
import { UploadDocsService } from './upload-docs.service';
import { AuthService } from '../../auth/services/auth.service';
import { StoreService } from '../../shared/index';
import { of } from 'rxjs/observable/of';

@Injectable()
export class ApplicationService {
  store = new EventEmitter<any>();
  data: any;
  private filledForms = {
    info: false,
    contactInfo: false,
    agency: false,
    company: false,
    forms: false,
    isUploadDocsCompleted: false,
    applicationStatus: 'pending',
    isReplaceDocument: false,
    need_correction_for: '',
    applicationError: {},
    applicationErrorState: []
  };
  applicationId: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private authService: AuthService,
    private storeService: StoreService
  ) {
    this.userService.store.subscribe(res => {
      const dynamicKey = 'personal';
      const { [dynamicKey]: personal } = res;
      this.filledForms.contactInfo = !!personal;
      this.set();
    });

    this.authService.isLoggedIn().subscribe(
      res => {
        if (!res) {
          this.userService.destroy();
          this.destroy();
        } else {
          this.userService.fetch().subscribe();
        }
      }
    );
  }

  private updateFilledForms() {
    const { company,
      agency,
      forms,
      uploadDocs,
      state,
      is_upload_docs_completed,
      isExistingAgency,
      need_correction_for,
      error,
      errorState
    } = this.data;
    this.filledForms.company = isExistingAgency ? !!this.filledForms.contactInfo : !!company;
    this.filledForms.agency = !!agency;
    this.filledForms.forms = !!this.getFormsStatus(!!forms ? forms : {});
    this.filledForms.isUploadDocsCompleted = is_upload_docs_completed;
    this.filledForms.applicationStatus = state;
    this.filledForms.info = !!isExistingAgency;
    this.filledForms.need_correction_for = need_correction_for;
    this.filledForms.applicationError = error;
    if (errorState) {
      this.filledForms.applicationErrorState = errorState.split(',');
    } else {
      this.filledForms.applicationErrorState = []; 
    }
  }

  fetch(id = null) {
    const { GET_APPLICATION } = APIUrls;
    const { userId } = this.userService.get();
    const url = id ? GET_APPLICATION + id : GET_APPLICATION;
    return this.http
      .get(url)
      .map(
        res => {
          this.data = res;
          return res;
        }
      )
      .do(
        () => {
          this.set();
          if (id) {
            this.userService.fetch(this.data.createdBy).subscribe();
          }
        }
      );
  }

  get(key = '', isForcedDispatch = false) {
    if (isForcedDispatch) {
      setTimeout(() => this.forceDispatch(), 100);
    }
    if (!!key && !!this.data) {
      return this.data[key];
    }

    return this.data;
  }

  set(key = '', formData = {}) {
    if (!!key) {
      this.data[key] = formData;
    }
    if (!!this.data) {
      this.updateFilledForms();
      this.data.filledForms = this.filledForms;
      setTimeout(() => this.store.next(this.data), 10);
      this.storeService.dispatch({ type: APPLICATION_DATA_ACTION, payload: this.data });
    }
  }

  save(tag, data) {
    const { SAVE_APPLICATION } = APIUrls;
    const { _id } = this.data;
    return this.http
      .patch(SAVE_APPLICATION, { tag, data, applicationId: _id })
      .map(
        res => {
          this.set(tag, data);
          return res;
        }
      );
  }

  update(id, application, action = '') {
    const { UPDATE_APPLICATION } = APIUrls;
    return this.http
      .post(UPDATE_APPLICATION + id + '/' + action, application)
      .map(res => res)
      .do(() => this.fetch(id).subscribe());
  }

  forceDispatch() {
    this.set();
  }

  getFormsStatus(forms) {
    const statusOfSpecialities = forms.hasOwnProperty('staffingSpecialties') && forms.staffingSpecialties.length > 0;
    const statusOfService = forms.hasOwnProperty('serviceLines') && forms.serviceLines.length > 0;
    return statusOfSpecialities || statusOfService;
  }

  getAgencyName() {
    if (this.get('company')) {
      const { name } = this.get('company');
      return name;
    }
  }

  destroy() {
    this.data = {};
    this.store.emit(this.data);
  }

  hasTJCID() {
    const { jointCommission } = this.get('company');

    if (!jointCommission) {
      return false;
    }

    if (!jointCommission.hasOwnProperty('id')) {
      return false;
    }

    if (!jointCommission.id) {
      return false;
    }

    return true;
  }
}
