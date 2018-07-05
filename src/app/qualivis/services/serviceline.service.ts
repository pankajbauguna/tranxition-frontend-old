import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APIUrls } from '../../shared/constants';

@Injectable()
export class ServiceLineService {
  store = new EventEmitter<any>();
  data: any = {};

  constructor(
    private http: HttpClient
  ) {
  }
  fetch() {
    const { GET_SERVICE_LINES } = APIUrls;
    return this.http
      .get(GET_SERVICE_LINES)
      .map(
        res => {
          this.store.next(res);
          return res;
        }
      );
  }

  
}
