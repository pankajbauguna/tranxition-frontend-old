import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../services/user.service';
import { AppService } from '../../shared/app.service';

@Injectable()
export class UserResolver implements Resolve<any> {
  constructor(
    private userService: UserService,
    private appService: AppService
  ) { }

  resolve(): Observable<any> {
    this.appService.loader('stop');
    return this.userService.get(null, true);
  }
}
