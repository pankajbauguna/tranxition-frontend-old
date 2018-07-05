import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APIUrls } from '../../shared/constants';

@Injectable()
export class StatesService {
  store = new EventEmitter<any>();
  data: any = {};

  constructor(
    private http: HttpClient
  ) {
  }
  fetch() {
    const { GET_STATES } = APIUrls;
    return this.http
      .get(GET_STATES)
      .map(
        res => {
          this.store.next(res);
          return res;
        }
      );
  }

  
}
