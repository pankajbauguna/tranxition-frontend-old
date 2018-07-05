import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APIUrls } from '../../shared/constants';

@Injectable()
export class SpecialityService {
  store = new EventEmitter<any>();
  data: any = {};

  constructor(
    private http: HttpClient
  ) {
  }
  fetch() {
    const { GET_STAFFINGS_SPECIALTIESTS } = APIUrls;
    return this.http
      .get(GET_STAFFINGS_SPECIALTIESTS)
      .map(
        res => {
          this.store.next(res);
          return res;
        }
      );
  }

  
}
