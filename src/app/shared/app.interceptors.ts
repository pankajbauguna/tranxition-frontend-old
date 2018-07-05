import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { AuthService } from '../auth/services/auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';
import { _throw } from 'rxjs/observable/throw';
import { CookieService } from 'ngx-cookie';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { environment } from '../../environments/environment';
import { DEFAULT_HTTP_TIMEOUT, ERROR } from './constants';
import { AppService } from './app.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  private defaultTimeout = DEFAULT_HTTP_TIMEOUT;

  constructor(
    private injector: Injector,
    private cookie: CookieService,
    private router: Router,
    private location: Location
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { body, headers, url } = request;
    const timeout = Number(headers.get('timeout')) || this.defaultTimeout;
    request.headers.delete('timeout');
    const authService = this.injector.get(AuthService);
    const appService = this.injector.get(AppService);
    const token = authService.getToken();
    const customHeaders = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Expires': '0',
      'Pragma': 'no-cache',
      'Authorization': `${token}`
    });
    request = request.clone({
      url: environment.apiHost + request.url,
      headers: customHeaders
    });

    let reqHandler = next.handle(request);
    if (body && body.tag === 'uploadDocs') {
      reqHandler = reqHandler;
    } else {
      reqHandler.timeout(timeout);
    }
    return (
      reqHandler
      .catch(err => {
        const { error: { message }, status, name } = err;
        if ((name === 'TimeoutError' || status === 0)) {
          this.router.navigate([ERROR.URL]);
        }
        if (err instanceof HttpErrorResponse) {
          if (status === 401) { // If Request is sending 401 request then remove all cookies and move user to login.
            this.cookie.removeAll();
            location.reload(); // Todo : Need to work on
          }
          err = { message, status };
        }
        appService.loader('stop');
        return _throw(err);
      })
    );
  }
}
