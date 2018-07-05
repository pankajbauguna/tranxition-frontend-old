import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { StatesService } from '../services/states.service';

@Injectable()
export class StatesResolver implements Resolve<any> {
  constructor(
    private statesService: StatesService
  ) { }

  resolve(): Observable<any> {
    return this.statesService.fetch();
  }
}
