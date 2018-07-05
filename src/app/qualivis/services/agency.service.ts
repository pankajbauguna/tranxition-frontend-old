import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APIUrls } from '../../shared/constants';
import { ApplicationService } from './application.service';
import { UserService } from './user.service';

@Injectable()
export class AgencyService {
  store = new EventEmitter<any>();
  private data: any;
  constructor(
    private http: HttpClient,
    private applicationService: ApplicationService,
    private userService: UserService
  ) { }

  get(isForcedDispatch = false) {
    const agency = this.applicationService.get('agency', isForcedDispatch);
    return !!agency && agency;
  }

  getDocuSignUrl(applicationId) {
    const { GET_DOCU_SIGN_URL } = APIUrls;
    return this.http
    .get(GET_DOCU_SIGN_URL+'/'+applicationId);
  }

  save(data) {
    return this.applicationService
      .save('agency', data)
      .map(
        res => {
          this.applicationService.set('agency', data); // Update application data
          return res;
        }
      );
  }
}

