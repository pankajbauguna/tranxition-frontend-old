import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { LocalTimePipe, DateFormatPipe } from 'angular2-moment';

import { APIUrls, LOGGED_USER_INFO_ACTION } from '../../shared/constants';
import { StoreService } from '../../shared/store';

@Injectable()
export class DashboardService {
  state = new BehaviorSubject(null);
  private data: any;
  constructor(
    private http: HttpClient,
    private store: StoreService,
    private localDate: LocalTimePipe,
    private formatDate: DateFormatPipe
  ) {
    this.data = {};

    // Subscribe global store to get user info changes
    this.store.state.subscribe(
      ({ type, payload }) => {
        if (type === LOGGED_USER_INFO_ACTION) {
          this.data[LOGGED_USER_INFO_ACTION] = payload;
          this.set(this.data);
        }
      }
    );
  }

  set(data) {
    if (this.data.hasOwnProperty('applications')) {
      this.data.applications.map(
        (application) => {
          application.documentSignedDate = this.transformDate(application.documentSignedDate);
          return application;
        }
      );
    }
    this.data = { ...this.data, ...data };
    this.state.next(this.data);
  }

  get(key) {
    return key ? this.data[key] : this.data;
  }

  /**
   * @description
   * This will fetch both applications and chart data
   * @returns {Object}
   */
  fetch() {
    return forkJoin([
      this.fetchChartData(),
      this.fetchApplications({ status: 'all' })
    ]).map(
      response => {
        const res = {
          chart: response[0],
          applications: response[1]
        };
        this.set(res);
        return res;
      }
    );
  }

  /**
   * @description
   * Fetch chart data
   * @returns {Object}
   */
  fetchChartData() {
    const { GET_APPLICATION_COUNTS } = APIUrls;
    return this.http
      .get(GET_APPLICATION_COUNTS)
      .map(res => {
        this.data['chart'] = res;
        this.set(this.data);
        return res;
      });
  }

  /**
   * @description
   * Fetch all applications
   * @param {Object} params Query parameters
   * @returns {Object}
   */
  fetchApplications(params = {}) {
    const { GET_APPLICATION_BY_STATUS } = APIUrls;
    const dynamicKey = 'status';
    const { [dynamicKey]: status } = params;
    const url = GET_APPLICATION_BY_STATUS + '/' + status ;

    return this.http
      .get(url)
      .map(res => {
        this.data['applications'] = res;
        this.set(this.data);
        return res;
      });
  }

  /**
   * @description
   * Filter applications data using applications state
   * @param {Stinrg} state Applications state
   * @return {Object[]}
   */
  filterApplicationsByStatus(state) {
    const { applications } = this.data;
    if (applications) {
      return applications.filter(
        (application) => {
          const matchValue = state === 'accepted' ? 'approved' : state;
          return application.state === matchValue;
        }
      );
    }
    return [];
  }

  /**
   * @description
   * Search applications by agency name
   * @param {Object} params Query parameters
   * @returns {Object}
   */
  searchApplications(params = {}) {
    const { GET_APPLICATION_BY_AGENCY_NAME } = APIUrls;
    const url = GET_APPLICATION_BY_AGENCY_NAME;
    return this.http
      .post(url,params)
      .map(res => {
        this.data['applications'] = res;
        this.set(this.data);
        return res;
      });
  }

  /**
   * @description
   * Search applications by agency name
   * @param {Object} params Query parameters
   * @returns {Object}
   */
  resetApplication(applicationId, action) {
    const { RESET_APPLICATION } = APIUrls;
    const url = RESET_APPLICATION + '/' + applicationId + '/reset';
    return this.http
      .post(url, {'action': action})
      .map(res => {
        // this.data['applications'] = res;
        this.set(this.data);
        return res;
      });
  }

  updateApplication({ id, application }) {
    const { UPDATE_APPLICATION } = APIUrls;
    return this.http
      .post(UPDATE_APPLICATION + id + '/update', { ...application })
      .map(
        res => {
          return res;
        }
      );
  }

  /**
   * @description
   * Get logged user information from global store
   */
  getUserInfo() {
    return this.get(LOGGED_USER_INFO_ACTION);
  }

  removeApplicationReviewer(id) {
    const { UNLOCK_APPLICATION } = APIUrls;
    return this.http
      .patch(UNLOCK_APPLICATION + id, { reviewUserId: null });
  }

  transformDate(date) {
    if (!date) {
      return '';
    }
    const localDate = this.localDate.transform(date);
    const formattedDate = this.formatDate.transform(localDate, 'MM/DD/YYYY');
    return formattedDate;
  }
}

