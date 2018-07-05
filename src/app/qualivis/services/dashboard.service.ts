import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { APIUrls } from '../../shared/constants';
import { ApplicationService } from './application.service';
import { UserService } from './user.service';


@Injectable()
export class DashboardService {
  store = new BehaviorSubject(null);
  private data: any;
  constructor(
    private http: HttpClient,
    private applicationService: ApplicationService,
    private userService: UserService
  ) { }

  set(data) {
    this.data = data;
    this.store.next(this.data);
  }

  get(query = {}) {
    return this.data;
  }

  fetch() {
    return forkJoin([
      this.fetchChartData(),
      this.fetchApplications({ status: 'all' })
    ]).map(
      response => {
        return ({
          chart: response[0],
          applications: response[1]
        });
      }
    );
  }

  fetchChartData() {
    const { GET_APPLICATION_COUNTS } = APIUrls;
    return this.http
      .get(GET_APPLICATION_COUNTS)
      .map(res => {
        this.set(res);
        return res;
      });
  }

  fetchApplications(params = {}) {
    const { GET_APPLICATION_BY_STATUS } = APIUrls;
    const dynamicKey = 'status';
    const { [dynamicKey]: status } = params;
    const url = GET_APPLICATION_BY_STATUS + '/' + status ;

    return this.http
      .get(url)
      .map(res => {
        this.set(res);
        return res;
      });
  }
}

